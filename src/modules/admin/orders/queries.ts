import { db } from "@/db";
import {
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  profiles,
} from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
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
  awbNumber: string | null;
}

export interface AdminOrderListResult {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<OrderStatus, number>;
}

// ─────────────────────────────────────────────────────────────────────
// listAllOrders — admin sees all orders, filterable by status and search
// ─────────────────────────────────────────────────────────────────────

export async function listAllOrders(opts: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}): Promise<AdminOrderListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (opts.status) {
    conditions.push(eq(orders.status, opts.status));
  }
  if (opts.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, term),
        ilike(profiles.email, term),
        ilike(profiles.phone, term),
        ilike(orders.awbNumber, term)
      )
    );
  }

  const whereClause =
    conditions.length === 1
      ? conditions[0]
      : conditions.length > 1
        ? and(...conditions)
        : undefined;

  const [rows, countResult, statusCountsRaw] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        customerEmail: profiles.email,
        awbNumber: orders.awbNumber,
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
      .leftJoin(profiles, eq(profiles.id, orders.userId))
      .where(whereClause),

    db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status),
  ]);

  const total = countResult[0]?.count ?? 0;

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  for (const r of statusCountsRaw) {
    if (r.status in statusCounts) {
      statusCounts[r.status] = r.count;
    }
  }

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
        awbNumber: r.awbNumber ?? null,
      })
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    statusCounts,
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
        with: {
          changedByUser: {
            columns: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
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
    (h) => {
      const adminName = h.changedByUser
        ? [h.changedByUser.firstName, h.changedByUser.lastName]
            .filter(Boolean)
            .join(" ") || h.changedByUser.email
        : null;

      return {
        id: h.id,
        status: h.status,
        note: h.note,
        createdAt: h.createdAt,
        changedBy: h.changedByUser
          ? {
              id: h.changedByUser.id,
              email: h.changedByUser.email,
              name: adminName,
            }
          : null,
      };
    }
  );

  const mappedPayment: OrderPayment | null = payment
    ? {
        status: payment.status,
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
