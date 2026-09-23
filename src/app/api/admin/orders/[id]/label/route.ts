import { NextResponse } from "next/server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

import { getDtdcShippingLabel } from "@/modules/shipping";

export const GET = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  await assertAdmin();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (!order.awbNumber) {
    throw new ValidationError(
      "No AWB number assigned to this order yet. Create a DTDC shipment first."
    );
  }

  const { buffer, contentType } = await getDtdcShippingLabel(
    order.awbNumber,
    "pdf"
  );

  if (!buffer) {
    throw new ValidationError("Failed to generate label from DTDC.");
  }

  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": contentType || "application/pdf",
      "Content-Disposition": `inline; filename="DTDC-Label-${order.awbNumber}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
});
