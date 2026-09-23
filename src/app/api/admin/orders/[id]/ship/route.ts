import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { orderStatusHistory, orders } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { withErrorHandling } from "@/lib/errors";

import { getAdminOrderDetails } from "@/modules/admin/orders";
import {
  sendOrderShippedEmail,
  sendOrderShippedSMS,
} from "@/modules/notifications";
import { createDtdcShipment } from "@/modules/shipping";

const shipBodySchema = z
  .object({
    weightKg: z.number().positive().optional(),
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    markAsShipped: z.boolean().optional().default(true),
  })
  .optional();

export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const admin = await assertAdmin();

  let bodyData: z.infer<typeof shipBodySchema>;
  try {
    const raw = await (req as NextRequest).json();
    bodyData = shipBodySchema.parse(raw);
  } catch {
    bodyData = undefined;
  }

  // Fetch full order details for DTDC shipment creation
  const order = await getAdminOrderDetails(orderId);

  // Call official DTDC Booking API (Softdata Upload v2.0)
  const result = await createDtdcShipment(order, {
    weightKg: bodyData?.weightKg,
    length: bodyData?.length,
    width: bodyData?.width,
    height: bodyData?.height,
  });

  const now = new Date();
  const markShipped = bodyData?.markAsShipped ?? true;
  const shouldTransitionStatus = markShipped && order.status !== "shipped";

  // Atomically update order with DTDC shipment data
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        awbNumber: result.awbNumber,
        courierName: "DTDC",
        shippingLabelUrl: result.labelUrl,
        shippingMetadata: {
          consignmentId: result.referenceNumber,
          referenceNumber: result.referenceNumber,
          bookedAt: now.toISOString(),
        },
        ...(shouldTransitionStatus
          ? { status: "shipped", shippedAt: now }
          : {}),
      })
      .where(eq(orders.id, orderId));

    if (shouldTransitionStatus) {
      await tx.insert(orderStatusHistory).values({
        id: createId(),
        orderId,
        status: "shipped",
        note: `Consignment created via DTDC API. AWB: ${result.awbNumber}`,
        changedBy: admin.id,
      });
    }
  });

  // Fire-and-forget shipped notifications if transitioned to shipped
  if (shouldTransitionStatus) {
    getAdminOrderDetails(orderId)
      .then((details) =>
        Promise.all([
          sendOrderShippedEmail(details),
          sendOrderShippedSMS(
            details.shippingAddress.phone ?? "",
            details.orderNumber,
            result.awbNumber
          ),
        ])
      )
      .catch((err) =>
        console.error(
          "[notifications] shipped notification failed on DTDC ship:",
          err
        )
      );
  }

  return NextResponse.json({
    success: true,
    awbNumber: result.awbNumber,
    labelUrl: result.labelUrl,
  });
});
