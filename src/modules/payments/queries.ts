import { db } from "@/db";
import {
  checkoutSessions,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import "server-only";

import { NotFoundError } from "@/lib/errors";

import { clearCart } from "@/modules/cart";
import { getCheckoutSession } from "@/modules/checkout";
import { deductInventory } from "@/modules/checkout/inventory";
import {
  sendOrderConfirmationEmail,
  sendOrderConfirmationSMS,
} from "@/modules/notifications";
import { getOrderDetails } from "@/modules/orders";

import { verifyPaymentSignature } from "./razorpay";

export function generateOrderNumber(): string {
  const hashSegment = createId().slice(0, 6).toUpperCase();
  return `SUREKH-${hashSegment}`;
}

interface ProcessPaymentSuccessInput {
  checkoutSessionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  method?: "upi" | "card" | "netbanking" | "wallet" | "cod";
}

export async function processPaymentSuccess(input: ProcessPaymentSuccessInput) {
  const {
    checkoutSessionId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    method,
  } = input;

  // 1. Idempotency Check: check if payment record already exists
  const existingPayment = await db.query.payments.findFirst({
    where: eq(payments.razorpayPaymentId, razorpayPaymentId),
    with: {
      order: true,
    },
  });

  if (existingPayment && existingPayment.order) {
    return {
      orderId: existingPayment.orderId,
      orderNumber: existingPayment.order.orderNumber,
    };
  }

  // 2. Signature verification if provided
  if (razorpaySignature) {
    verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
  }

  // 3. Fetch checkout session
  const session = await db.query.checkoutSessions.findFirst({
    where: eq(checkoutSessions.id, checkoutSessionId),
  });

  if (!session) {
    throw new NotFoundError("Checkout session");
  }

  if (session.orderId) {
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.id, session.orderId),
    });
    if (existingOrder) {
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
      };
    }
  }

  // Get full session line items & address
  const hydratedSession = await getCheckoutSession(session.id, session.userId);

  // 4. Transaction: Order creation, payment record, inventory deduction, cart clearance
  const result = await db.transaction(async (tx) => {
    const newOrderId = createId();
    const orderNum = generateOrderNumber();

    const [newOrder] = await tx
      .insert(orders)
      .values({
        id: newOrderId,
        orderNumber: orderNum,
        userId: session.userId,
        status: "confirmed",
        shippingAddress: hydratedSession.address,
        subtotal: session.subtotal,
        discountAmount: session.discountAmount,
        couponCode: null,
        taxAmount: session.taxAmount,
        shippingAmount: session.shippingAmount,
        total: session.total,
        confirmedAt: new Date(),
      })
      .returning();

    // Insert order items
    for (const item of hydratedSession.lineItems) {
      await tx.insert(orderItems).values({
        id: createId(),
        orderId: newOrder.id,
        variantId: item.variantId,
        productSnapshot: item.snapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        taxAmount: item.taxAmount.toString(),
        total: item.total.toString(),
      });
    }

    // Insert order status history
    await tx.insert(orderStatusHistory).values({
      id: createId(),
      orderId: newOrder.id,
      status: "confirmed",
      note: "Payment completed successfully",
    });

    // Insert payment record
    await tx.insert(payments).values({
      id: createId(),
      orderId: newOrder.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || null,
      amount: session.total,
      currency: "INR",
      status: "captured",
      method: method || null,
    });

    // Deduct stock quantity and reserved quantity
    await deductInventory(
      tx,
      hydratedSession.lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    // Clear user cart
    await clearCart({ userId: session.userId });

    // Link orderId to checkout session
    await tx
      .update(checkoutSessions)
      .set({ orderId: newOrder.id })
      .where(eq(checkoutSessions.id, session.id));

    return {
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    };
  });

  // Fire-and-forget: fetch full order details then dispatch email + SMS.
  // Notification failure must NEVER break the payment response — errors are
  // logged but not re-thrown.
  getOrderDetails(result.orderId, session.userId)
    .then((details) =>
      Promise.all([
        sendOrderConfirmationEmail(details),
        sendOrderConfirmationSMS(
          details.shippingAddress.phone ?? "",
          details.orderNumber,
          Number(details.total)
        ),
      ])
    )
    .catch((err) =>
      console.error(
        "[notifications] order confirmation post-payment failed:",
        err
      )
    );

  return result;
}
