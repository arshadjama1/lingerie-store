import { db } from "@/db";
import { checkoutSessions } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import "server-only";

import {
  CheckoutExpiredError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

import { getAddressById } from "@/modules/addresses";
import { getCart } from "@/modules/cart";

import { calculateCheckoutTotals, calculateLineItem } from "./calculations";
import { releaseInventory, reserveInventory } from "./inventory";
import type {
  CreateCheckoutSessionInput,
  HydratedCheckoutSession,
} from "./types";

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<HydratedCheckoutSession> {
  const { userId, cartId, addressId } = input;

  const address = await getAddressById(userId, addressId);
  const cart = await getCart({ userId });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ValidationError("Cart is empty");
  }

  if (cart.id !== cartId) {
    throw new ValidationError("Invalid cart reference");
  }

  const lineItems = cart.items.map(calculateLineItem);
  const totals = calculateCheckoutTotals(lineItems, 0);

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
      couponId: null,
      subtotal: totals.subtotal.toString(),
      discountAmount: totals.discountAmount.toString(),
      taxAmount: totals.taxAmount.toString(),
      shippingAmount: totals.shippingAmount.toString(),
      total: totals.total.toString(),
      razorpayOrderId: null,
      orderId: null,
      expiresAt,
    });
  });

  return {
    id: sessionId,
    userId,
    cartId: cart.id,
    addressId: address.id,
    couponId: null,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxAmount: totals.taxAmount,
    shippingAmount: totals.shippingAmount,
    total: totals.total,
    razorpayOrderId: null,
    orderId: null,
    expiresAt,
    createdAt: new Date(),
    address,
    lineItems,
  };
}

export async function getCheckoutSession(
  sessionId: string,
  userId: string
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

  if (new Date(session.expiresAt) <= new Date()) {
    throw new CheckoutExpiredError();
  }

  const address = await getAddressById(userId, session.addressId);
  const cart = await getCart({ userId });

  const lineItems = cart ? cart.items.map(calculateLineItem) : [];

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
    total: Number(session.total),
    razorpayOrderId: session.razorpayOrderId,
    orderId: session.orderId,
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

  if (!session) return;

  const cart = await getCart({ userId: session.userId });
  if (!cart) return;

  await db.transaction(async (tx) => {
    await releaseInventory(
      tx,
      cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    await tx
      .update(checkoutSessions)
      .set({ expiresAt: new Date() })
      .where(eq(checkoutSessions.id, sessionId));
  });
}
