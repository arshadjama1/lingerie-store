import { db } from "@/db";
import {
  inventory,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  profiles,
  returnRequests,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import "server-only";

import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";

import { cancelDtdcShipment } from "@/modules/shipping";

import type {
  ListOrdersResult,
  OrderDetails,
  OrderItem,
  OrderPayment,
  OrderStatus,
  OrderStatusHistoryEntry,
  OrderSummary,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// listUserOrders
// ─────────────────────────────────────────────────────────────────────

export async function listUserOrders(
  userId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<ListOrdersResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? 10;
  const offset = (page - 1) * limit;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(SELECT COUNT(*)::int FROM ${orderItems} oi WHERE oi.order_id = ${orders}.id)`,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(eq(orders.userId, userId)),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    orders: rows.map(
      (r): OrderSummary => ({
        id: r.id,
        orderNumber: r.orderNumber,
        status: r.status,
        total: r.total,
        itemCount: r.itemCount,
        createdAt: r.createdAt,
      })
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────
// getOrderDetails
// ─────────────────────────────────────────────────────────────────────

export async function getOrderDetails(
  orderId: string,
  userId: string
): Promise<OrderDetails> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: true,
      statusHistory: {
        orderBy: [asc(orderStatusHistory.createdAt)],
      },
    },
  });

  if (!order || order.userId !== userId) {
    throw new NotFoundError("Order");
  }

  // Fetch payment and profile email in parallel (both are 1:1 reads)
  const [payment, profile] = await Promise.all([
    db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    }),
    db.query.profiles.findFirst({
      where: eq(profiles.id, order.userId),
      columns: { email: true },
    }),
  ]);

  const mappedItems: OrderItem[] = order.items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxAmount: item.taxAmount,
    total: item.total,
    productSnapshot: item.productSnapshot,
  }));

  const mappedHistory: OrderStatusHistoryEntry[] = order.statusHistory.map(
    (h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      createdAt: h.createdAt,
    })
  );

  const mappedPayment: OrderPayment | null = payment
    ? {
        method: payment.method,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
      }
    : null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerEmail: profile?.email ?? null,
    shippingAddress: order.shippingAddress as OrderDetails["shippingAddress"],
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    total: order.total,
    confirmedAt: order.confirmedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    awbNumber: order.awbNumber,
    items: mappedItems,
    payment: mappedPayment,
    statusHistory: mappedHistory,
  };
}

// ─────────────────────────────────────────────────────────────────────
// cancelOrder
// ─────────────────────────────────────────────────────────────────────

const CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "confirmed"];

export async function cancelOrder(
  orderId: string,
  userId: string
): Promise<{ success: true; orderNumber: string }> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });

  if (!order || order.userId !== userId) {
    throw new NotFoundError("Order");
  }

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new ValidationError(
      `Order cannot be cancelled. Current status: ${order.status}`
    );
  }

  await db.transaction(async (tx) => {
    // 1. Update order status
    await tx
      .update(orders)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(orders.id, orderId));

    // 2. Append to status history
    await tx.insert(orderStatusHistory).values({
      id: createId(),
      orderId,
      status: "cancelled",
      note: "Cancelled by customer",
    });

    // 3. Release reserved inventory for each order item
    // Note: inventory was fully deducted (not just reserved) during payment.
    // We restore both quantity and reserved_quantity back to before the purchase.
    const inventoryItems = order.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // releaseInventory only restores reservedQuantity. For a post-payment cancellation
    // (where inventory was fully deducted), we also restore actual stock quantity.
    for (const item of inventoryItems) {
      await tx
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} + ${item.quantity}`,
        })
        .where(eq(inventory.variantId, item.variantId));
    }
  });

  // If order was already booked with DTDC, asynchronously cancel with carrier
  if (order.awbNumber) {
    cancelDtdcShipment(order.awbNumber).catch((err) =>
      console.error(
        "[DTDC] Shipment cancellation failed for order",
        order.orderNumber,
        err
      )
    );
  }

  return { success: true, orderNumber: order.orderNumber };
}

// ─────────────────────────────────────────────────────────────────────
// createReturnRequest
// ─────────────────────────────────────────────────────────────────────

export async function createReturnRequest(
  orderId: string,
  userId: string,
  reason: string
): Promise<{ success: true }> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order || order.userId !== userId) {
    throw new NotFoundError("Order");
  }

  if (order.status !== "delivered") {
    throw new ValidationError(
      "Return requests can only be submitted for delivered orders"
    );
  }

  const existing = await db.query.returnRequests.findFirst({
    where: and(
      eq(returnRequests.orderId, orderId),
      eq(returnRequests.userId, userId)
    ),
  });

  if (existing) {
    throw new ConflictError(
      "A return request for this order has already been submitted"
    );
  }

  await db.insert(returnRequests).values({
    id: createId(),
    orderId,
    userId,
    reason,
    status: "requested",
  });

  return { success: true };
}
