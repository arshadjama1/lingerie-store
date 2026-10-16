import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { inventory, orderStatusHistory, orders, payments } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { ValidationError, withErrorHandling } from "@/lib/errors";

import { getAdminOrderDetails } from "@/modules/admin/orders";
import {
  sendOrderShippedEmail,
  sendOrderShippedSMS,
} from "@/modules/notifications";
import { VALID_TRANSITIONS } from "@/modules/orders";
import { razorpayClient } from "@/modules/payments";

const batchSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(100),
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

export const POST = withErrorHandling(async (req: Request) => {
  const admin = await assertAdmin();
  const parsed = batchSchema.safeParse(await (req as NextRequest).json());
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    );
  }

  const { orderIds, status: newStatus, note } = parsed.data;

  // Fetch all requested orders
  const foundOrders = await db.query.orders.findMany({
    where: inArray(orders.id, orderIds),
    with: { items: true },
  });

  const orderMap = new Map(foundOrders.map((o) => [o.id, o]));

  const updatedOrderNumbers: string[] = [];
  const errors: { orderId: string; orderNumber?: string; reason: string }[] =
    [];

  for (const orderId of orderIds) {
    const order = orderMap.get(orderId);
    if (!order) {
      errors.push({ orderId, reason: "Order not found" });
      continue;
    }

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) {
      errors.push({
        orderId,
        orderNumber: order.orderNumber,
        reason: `Cannot transition from "${order.status}" to "${newStatus}"`,
      });
      continue;
    }

    // If refunding, call Razorpay before DB write
    if (newStatus === "refunded") {
      const payment = await db.query.payments.findFirst({
        where: eq(payments.orderId, orderId),
      });

      if (payment?.razorpayPaymentId) {
        try {
          await razorpayClient.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(Number(order.total) * 100),
            notes: {
              reason: note ?? "Admin batch refund",
              orderId,
            },
          });
        } catch (refundErr) {
          console.error(
            `[batch-refund] Razorpay refund failed for order ${order.orderNumber}:`,
            refundErr
          );
          errors.push({
            orderId,
            orderNumber: order.orderNumber,
            reason: "Razorpay refund failed",
          });
          continue;
        }
      }
    }

    // Apply DB updates
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

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({ status: newStatus, ...timestamps })
          .where(eq(orders.id, orderId));

        await tx.insert(orderStatusHistory).values({
          id: createId(),
          orderId,
          status: newStatus,
          note: note ? `[Batch update] ${note}` : "[Batch update]",
          changedBy: admin.id,
        });

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

      updatedOrderNumbers.push(order.orderNumber);

      // Trigger shipped notifications in background
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
            console.error(
              `[notifications] shipped notification failed for ${order.orderNumber}:`,
              err
            )
          );
      }
    } catch (dbErr) {
      console.error(
        `[batch-status] DB write failed for order ${order.orderNumber}:`,
        dbErr
      );
      errors.push({
        orderId,
        orderNumber: order.orderNumber,
        reason: "Database error during status update",
      });
    }
  }

  return NextResponse.json({
    success: true,
    updatedCount: updatedOrderNumbers.length,
    failedCount: errors.length,
    updatedOrderNumbers,
    errors,
  });
});
