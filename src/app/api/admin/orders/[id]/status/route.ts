import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { inventory, orderStatusHistory, orders, payments } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

import { getAdminOrderDetails } from "@/modules/admin/orders";
import {
  sendOrderShippedEmail,
  sendOrderShippedSMS,
} from "@/modules/notifications";
import { VALID_TRANSITIONS } from "@/modules/orders";
import { razorpayClient } from "@/modules/payments";

const bodySchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().optional(),
});

export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const admin = await assertAdmin();
  const body = bodySchema.safeParse(await (req as NextRequest).json());
  if (!body.success)
    throw new ValidationError(body.error.issues[0]?.message ?? "Invalid input");

  const { status: newStatus, note } = body.data;

  // Fetch current order with items (needed for stock restoration)
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
  if (!order) throw new NotFoundError("Order");

  // Validate transition
  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from "${order.status}" to "${newStatus}". ` +
        `Allowed: ${allowed.length ? allowed.join(", ") : "none"}`
    );
  }

  // ── Refund: Call Razorpay BEFORE any DB write ────────────────────────────
  // If the Razorpay API fails, we throw immediately and the DB status is never
  // updated — preventing a false "refunded" label with no money returned.
  if (newStatus === "refunded") {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    if (payment?.razorpayPaymentId) {
      try {
        await razorpayClient.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(Number(order.total) * 100), // full refund in paise
          notes: { reason: note ?? "Admin initiated refund", orderId },
        });
      } catch (refundErr) {
        console.error("[refund] Razorpay refund API failed:", refundErr);
        throw new ValidationError(
          "Razorpay refund failed — check the Razorpay Dashboard. Order status was not changed."
        );
      }
    }
  }

  // Update status + timestamp fields
  const now = new Date();
  const timestamps: Partial<{
    confirmedAt: Date;
    shippedAt: Date;
    deliveredAt: Date;
    cancelledAt: Date;
  }> = {};
  if (newStatus === "confirmed") timestamps.confirmedAt = now;
  if (newStatus === "shipped") timestamps.shippedAt = now;
  if (newStatus === "delivered") timestamps.deliveredAt = now;
  if (newStatus === "cancelled") timestamps.cancelledAt = now;

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: newStatus, ...timestamps })
      .where(eq(orders.id, orderId));

    await tx.insert(orderStatusHistory).values({
      id: createId(),
      orderId,
      status: newStatus,
      note: note ?? null,
      changedBy: admin.id,
    });

    // Restore inventory when an order is refunded so items can be resold.
    if (newStatus === "refunded" && order.items.length > 0) {
      for (const item of order.items) {
        await tx
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} + ${item.quantity}`,
          })
          .where(eq(inventory.variantId, item.variantId));
      }
    }
  });

  // Fire-and-forget shipped notifications
  if (newStatus === "shipped") {
    getAdminOrderDetails(orderId)
      .then((details) =>
        Promise.all([
          sendOrderShippedEmail(details),
          sendOrderShippedSMS(
            details.shippingAddress.phone ?? "",
            details.orderNumber,
            details.awbNumber
          ),
        ])
      )
      .catch((err) =>
        console.error("[notifications] shipped notification failed:", err)
      );
  }

  return NextResponse.json({
    success: true,
    order: { id: orderId, status: newStatus, orderNumber: order.orderNumber },
  });
});
