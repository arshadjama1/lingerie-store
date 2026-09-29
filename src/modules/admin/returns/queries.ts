import { db } from "@/db";
import { inventory, orders, profiles, returnRequests } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import "server-only";

import { NotFoundError, ValidationError } from "@/lib/errors";

import type { OrderItem } from "@/modules/orders";

import { RETURN_VALID_TRANSITIONS } from "./transitions";
import type {
  AdminReturnDetails,
  AdminReturnListResult,
  AdminReturnSummary,
  ReturnStatus,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// listAllReturns — admin sees all return requests, filterable by status
// ─────────────────────────────────────────────────────────────────────

export async function listAllReturns(opts: {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
}): Promise<AdminReturnListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  const whereClause = opts.status
    ? eq(returnRequests.status, opts.status)
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: returnRequests.id,
        orderId: returnRequests.orderId,
        orderNumber: orders.orderNumber,
        customerEmail: profiles.email,
        reason: returnRequests.reason,
        status: returnRequests.status,
        createdAt: returnRequests.createdAt,
      })
      .from(returnRequests)
      .leftJoin(orders, eq(orders.id, returnRequests.orderId))
      .leftJoin(profiles, eq(profiles.id, returnRequests.userId))
      .where(whereClause)
      .orderBy(desc(returnRequests.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(returnRequests)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    returns: rows.map(
      (r): AdminReturnSummary => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.orderNumber ?? "",
        customerEmail: r.customerEmail ?? null,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
      })
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────
// getAdminReturnDetails — full return details without ownership check
// ─────────────────────────────────────────────────────────────────────

export async function getAdminReturnDetails(
  returnId: string
): Promise<AdminReturnDetails> {
  const returnReq = await db.query.returnRequests.findFirst({
    where: eq(returnRequests.id, returnId),
  });

  if (!returnReq) {
    throw new NotFoundError("Return request");
  }

  const [order, profile] = await Promise.all([
    db.query.orders.findFirst({
      where: eq(orders.id, returnReq.orderId),
      with: { items: true },
    }),
    db.query.profiles.findFirst({
      where: eq(profiles.id, returnReq.userId),
      columns: { email: true },
    }),
  ]);

  if (!order) {
    throw new NotFoundError("Order");
  }

  const mappedItems: OrderItem[] = order.items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxAmount: item.taxAmount,
    total: item.total,
    productSnapshot: item.productSnapshot,
  }));

  return {
    id: returnReq.id,
    orderId: returnReq.orderId,
    orderNumber: order.orderNumber,
    customerEmail: profile?.email ?? null,
    reason: returnReq.reason,
    status: returnReq.status,
    notes: returnReq.notes,
    createdAt: returnReq.createdAt,
    updatedAt: returnReq.updatedAt,
    orderTotal: order.total,
    orderStatus: order.status,
    items: mappedItems,
    shippingAddress:
      order.shippingAddress as AdminReturnDetails["shippingAddress"],
  };
}

// ─────────────────────────────────────────────────────────────────────
// updateReturnStatus — validate transition, run transaction, restore
//                      inventory when status reaches "refunded"
// ─────────────────────────────────────────────────────────────────────

export async function updateReturnStatus(
  returnId: string,
  newStatus: ReturnStatus,
  notes?: string
): Promise<void> {
  // 1. Fetch current return to validate transition
  const returnReq = await db.query.returnRequests.findFirst({
    where: eq(returnRequests.id, returnId),
  });

  if (!returnReq) {
    throw new NotFoundError("Return request");
  }

  const allowed = RETURN_VALID_TRANSITIONS[returnReq.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from "${returnReq.status}" to "${newStatus}". ` +
        `Allowed: ${allowed.length ? allowed.join(", ") : "none"}`
    );
  }

  // 2. Pre-fetch order items BEFORE the transaction if inventory restoration
  //    is needed (avoids nested relational queries inside a transaction).
  let itemsToRestock: { variantId: string; quantity: number }[] = [];
  if (newStatus === "refunded") {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, returnReq.orderId),
      with: { items: true },
    });
    itemsToRestock = (order?.items ?? []).map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    }));
  }

  // 3. Execute update + optional inventory restoration atomically
  await db.transaction(async (tx) => {
    await tx
      .update(returnRequests)
      .set({
        status: newStatus,
        // Only write notes when the caller explicitly provides them
        ...(notes !== undefined ? { notes } : {}),
      })
      .where(eq(returnRequests.id, returnId));

    // Restore stock for all order items when the return is fully refunded
    // (items confirmed back in warehouse).
    if (newStatus === "refunded" && itemsToRestock.length > 0) {
      for (const item of itemsToRestock) {
        await tx
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} + ${item.quantity}`,
          })
          .where(eq(inventory.variantId, item.variantId));
      }
    }
  });
}
