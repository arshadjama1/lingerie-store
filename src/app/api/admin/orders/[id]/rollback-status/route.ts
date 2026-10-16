import { NextResponse } from "next/server";

import { db } from "@/db";
import { orderStatusHistory, orders } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { asc, eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

import type { OrderStatus } from "@/modules/orders/types";

export const POST = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const admin = await assertAdmin();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      statusHistory: {
        orderBy: [asc(orderStatusHistory.createdAt)],
      },
    },
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (order.status === "refunded") {
    throw new ValidationError(
      "Refunded orders cannot be rolled back because payment refunds and inventory restorations have already been finalized."
    );
  }

  if (order.status === "pending") {
    throw new ValidationError(
      "This order is already in the initial Pending status and cannot be rolled back."
    );
  }

  // Determine target previous status
  let targetStatus: OrderStatus;
  const timestampUpdates: {
    confirmedAt?: Date | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
    cancelledAt?: Date | null;
  } = {};

  if (order.status === "cancelled") {
    // Un-cancel: find the state prior to cancellation
    const activeEntries = order.statusHistory.filter(
      (h) => h.status !== "cancelled" && h.status !== "refunded"
    );
    targetStatus =
      activeEntries.length > 0
        ? activeEntries[activeEntries.length - 1].status
        : "pending";
    timestampUpdates.cancelledAt = null;
  } else if (order.status === "delivered") {
    targetStatus = "shipped";
    timestampUpdates.deliveredAt = null;
  } else if (order.status === "shipped") {
    targetStatus = "processing";
    timestampUpdates.shippedAt = null;
  } else if (order.status === "processing") {
    targetStatus = "confirmed";
  } else if (order.status === "confirmed") {
    targetStatus = "pending";
    timestampUpdates.confirmedAt = null;
  } else {
    throw new ValidationError(
      `Cannot determine rollback target for status "${order.status}"`
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: targetStatus,
        ...timestampUpdates,
      })
      .where(eq(orders.id, orderId));

    await tx.insert(orderStatusHistory).values({
      id: createId(),
      orderId,
      status: targetStatus,
      note: `Status rolled back from "${order.status}" to "${targetStatus}"`,
      changedBy: admin.id,
    });
  });

  return NextResponse.json({
    success: true,
    previousStatus: targetStatus,
    orderNumber: order.orderNumber,
  });
});
