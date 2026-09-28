import { NextResponse } from "next/server";

import { db } from "@/db";
import { orderStatusHistory, payments } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const admin = await assertAdmin();

  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, orderId),
  });

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  if (payment.method !== "cod") {
    throw new ValidationError("This order is not a COD order");
  }

  if (payment.status === "captured") {
    throw new ValidationError(
      "COD payment has already been marked as collected"
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: "captured" })
      .where(eq(payments.orderId, orderId));

    await tx.insert(orderStatusHistory).values({
      id: createId(),
      orderId,
      status: "delivered",
      note: "COD collected — payment received from customer",
      changedBy: admin.id,
    });
  });

  return NextResponse.json({ success: true });
});
