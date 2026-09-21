import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { orderStatusHistory, orders } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { getAdminOrderDetails } from "@/modules/admin/orders";
import {
  sendOrderShippedEmail,
  sendOrderShippedSMS,
} from "@/modules/notifications";

const bodySchema = z.object({
  awbNumber: z.string().min(1, "AWB number is required"),
  markAsShipped: z.boolean().optional().default(false),
});

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    throw new ForbiddenError();
  }
  return user;
}

export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const admin = await assertAdmin();
  const body = bodySchema.safeParse(await (req as NextRequest).json());
  if (!body.success)
    throw new ValidationError(body.error.issues[0]?.message ?? "Invalid input");

  const { awbNumber, markAsShipped } = body.data;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order) throw new NotFoundError("Order");

  const now = new Date();

  if (markAsShipped && order.status !== "shipped") {
    // Update AWB + status atomically
    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({ awbNumber, status: "shipped", shippedAt: now })
        .where(eq(orders.id, orderId));

      await tx.insert(orderStatusHistory).values({
        id: createId(),
        orderId,
        status: "shipped",
        note: `Marked as shipped. AWB: ${awbNumber}`,
        changedBy: admin.id,
      });
    });

    // Fire-and-forget shipped notifications
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
          "[notifications] shipped notification on AWB entry failed:",
          err
        )
      );
  } else {
    // Just save the AWB number
    await db.update(orders).set({ awbNumber }).where(eq(orders.id, orderId));
  }

  return NextResponse.json({ success: true });
});
