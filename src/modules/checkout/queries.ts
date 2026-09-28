import { db } from "@/db";
import { checkoutSessions } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNull, lte } from "drizzle-orm";
import "server-only";

import {
  CheckoutExpiredError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

import { getAddressById } from "@/modules/addresses";
import { getCart } from "@/modules/cart";
import { validateCoupon } from "@/modules/coupons";

import { calculateCheckoutTotals, calculateLineItem } from "./calculations";
import { releaseInventory, reserveInventory } from "./inventory";
import type {
  CheckoutLineItem,
  CreateCheckoutSessionInput,
  HydratedCheckoutSession,
} from "./types";

/** ₹49 Cash-on-Delivery surcharge. */
export const COD_FEE = 49;
/** Minimum subtotal (after coupon) for COD to be available. */
export const COD_MIN_SUBTOTAL = 499;
/** Maximum subtotal (after coupon) for COD to be available. */
export const COD_MAX_SUBTOTAL = 4999;

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<HydratedCheckoutSession> {
  const { userId, cartId, addressId, couponCode, paymentMethod } = input;

  const address = await getAddressById(userId, addressId);
  const cart = await getCart({ userId });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ValidationError("Cart is empty");
  }

  if (cart.id !== cartId) {
    throw new ValidationError("Invalid cart reference");
  }

  const lineItems = cart.items.map(calculateLineItem);

  // Fix #2: Validate coupon BEFORE the DB transaction so no lock contention
  let couponId: string | null = null;
  let discountAmount = 0;

  if (couponCode) {
    const subtotal = lineItems.reduce(
      (s, i) => s + i.unitPrice * i.quantity,
      0
    );
    const couponResult = await validateCoupon(couponCode, userId, subtotal);
    couponId = couponResult.couponId;
    discountAmount = couponResult.discountAmount;
  }

  // Determine COD fee: only for COD orders within the eligible range
  const subtotalAfterDiscount =
    lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0) -
    discountAmount;

  let codFee = 0;
  if (paymentMethod === "cod") {
    if (subtotalAfterDiscount < COD_MIN_SUBTOTAL) {
      throw new ValidationError(
        `Cash on Delivery is available for orders above ₹${COD_MIN_SUBTOTAL}`
      );
    }
    if (subtotalAfterDiscount > COD_MAX_SUBTOTAL) {
      throw new ValidationError(
        `Cash on Delivery is available for orders up to ₹${COD_MAX_SUBTOTAL}`
      );
    }
    codFee = COD_FEE;
  }

  const totals = calculateCheckoutTotals(lineItems, discountAmount, codFee);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const sessionId = createId();

  await db.transaction(async (tx) => {
    await reserveInventory(
      tx,
      cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    await tx.insert(checkoutSessions).values({
      id: sessionId,
      userId,
      cartId: cart.id,
      addressId: address.id,
      couponId,
      subtotal: totals.subtotal.toString(),
      discountAmount: totals.discountAmount.toString(),
      taxAmount: totals.taxAmount.toString(),
      shippingAmount: totals.shippingAmount.toString(),
      codFee: totals.codFee > 0 ? totals.codFee.toString() : null,
      total: totals.total.toString(),
      razorpayOrderId: null,
      orderId: null,
      status: "active",
      lineItems,
      expiresAt,
    });
  });

  return {
    id: sessionId,
    userId,
    cartId: cart.id,
    addressId: address.id,
    couponId,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxAmount: totals.taxAmount,
    shippingAmount: totals.shippingAmount,
    codFee: totals.codFee,
    total: totals.total,
    razorpayOrderId: null,
    orderId: null,
    status: "active",
    expiresAt,
    createdAt: new Date(),
    address,
    lineItems,
  };
}

export async function getCheckoutSession(
  sessionId: string,
  userId: string,
  options?: { allowExpired?: boolean }
): Promise<HydratedCheckoutSession> {
  const session = await db.query.checkoutSessions.findFirst({
    where: and(
      eq(checkoutSessions.id, sessionId),
      eq(checkoutSessions.userId, userId)
    ),
  });

  if (!session) {
    throw new NotFoundError("Checkout session");
  }

  if (!options?.allowExpired && new Date(session.expiresAt) <= new Date()) {
    throw new CheckoutExpiredError();
  }

  const address = await getAddressById(userId, session.addressId);

  let lineItems: CheckoutLineItem[] = [];
  if (session.lineItems && session.lineItems.length > 0) {
    lineItems = session.lineItems;
  } else {
    const cart = await getCart({ userId });
    lineItems = cart ? cart.items.map(calculateLineItem) : [];
  }

  return {
    id: session.id,
    userId: session.userId,
    cartId: session.cartId,
    addressId: session.addressId,
    couponId: session.couponId,
    subtotal: Number(session.subtotal),
    discountAmount: Number(session.discountAmount),
    taxAmount: Number(session.taxAmount),
    shippingAmount: Number(session.shippingAmount),
    codFee: Number(session.codFee ?? 0),
    total: Number(session.total),
    razorpayOrderId: session.razorpayOrderId,
    orderId: session.orderId,
    status: session.status,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    address,
    lineItems,
  };
}

export async function expireCheckoutSession(sessionId: string) {
  const session = await db.query.checkoutSessions.findFirst({
    where: eq(checkoutSessions.id, sessionId),
  });

  if (!session || session.status === "expired" || session.orderId) return;

  let itemsToRelease: { variantId: string; quantity: number }[] = [];
  if (session.lineItems && session.lineItems.length > 0) {
    itemsToRelease = session.lineItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));
  } else {
    const cart = await getCart({ userId: session.userId });
    if (cart) {
      itemsToRelease = cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    }
  }

  await db.transaction(async (tx) => {
    if (itemsToRelease.length > 0) {
      await releaseInventory(tx, itemsToRelease);
    }

    await tx
      .update(checkoutSessions)
      .set({
        status: "expired",
        expiresAt: new Date(),
      })
      .where(eq(checkoutSessions.id, sessionId));
  });
}

export async function cleanupExpiredCheckoutSessions(): Promise<number> {
  const now = new Date();

  const expiredSessions = await db.query.checkoutSessions.findMany({
    where: and(
      eq(checkoutSessions.status, "active"),
      lte(checkoutSessions.expiresAt, now),
      isNull(checkoutSessions.orderId)
    ),
  });

  let cleanedCount = 0;
  for (const session of expiredSessions) {
    let itemsToRelease: { variantId: string; quantity: number }[] = [];
    if (session.lineItems && session.lineItems.length > 0) {
      itemsToRelease = session.lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    } else {
      const cart = await getCart({ userId: session.userId });
      if (cart) {
        itemsToRelease = cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }));
      }
    }

    await db.transaction(async (tx) => {
      if (itemsToRelease.length > 0) {
        await releaseInventory(tx, itemsToRelease);
      }

      await tx
        .update(checkoutSessions)
        .set({
          status: "expired",
        })
        .where(eq(checkoutSessions.id, session.id));
    });

    cleanedCount++;
  }

  return cleanedCount;
}
