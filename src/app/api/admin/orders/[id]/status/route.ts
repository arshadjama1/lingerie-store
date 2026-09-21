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
import type { OrderStatus } from "@/modules/orders";

// Legal status transition map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

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

  const { status: newStatus, note } = body.data;

  // Fetch current order
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
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
