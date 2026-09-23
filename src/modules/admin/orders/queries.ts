import { db } from "@/db";
import {
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  profiles,
} from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import "server-only";

import { NotFoundError } from "@/lib/errors";

import type {
  OrderDetails,
  OrderItem,
  OrderPayment,
  OrderStatus,
  OrderStatusHistoryEntry,
} from "@/modules/orders";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  itemCount: number;
  createdAt: Date;
  customerEmail: string | null;
}

export interface AdminOrderListResult {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────
// listAllOrders — admin sees all orders, filterable by status
// ─────────────────────────────────────────────────────────────────────

export async function listAllOrders(opts: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}): Promise<AdminOrderListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  const whereClause = opts.status ? eq(orders.status, opts.status) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        customerEmail: profiles.email,
        itemCount: sql<number>`(SELECT COUNT(*)::int FROM ${orderItems} oi WHERE oi.order_id = ${orders.id})`,
      })
      .from(orders)
      .leftJoin(profiles, eq(profiles.id, orders.userId))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    orders: rows.map(
      (r): AdminOrderSummary => ({
        id: r.id,
        orderNumber: r.orderNumber,
        status: r.status,
        total: r.total,
        itemCount: r.itemCount,
        createdAt: r.createdAt,
        customerEmail: r.customerEmail ?? null,
      })
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────
// getAdminOrderDetails — full order without userId ownership check
// ─────────────────────────────────────────────────────────────────────

export async function getAdminOrderDetails(
  orderId: string
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

  if (!order) {
    throw new NotFoundError("Order");
  }

  const [payment, profile] = await Promise.all([
    db.query.payments.findFirst({ where: eq(payments.orderId, orderId) }),
    db.query.profiles.findFirst({
      where: eq(profiles.id, order.userId),
      columns: { email: true, phone: true },
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
