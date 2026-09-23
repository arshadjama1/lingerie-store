import { NextResponse } from "next/server";

import { db } from "@/db";
import { orders, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
  NotFoundError,
  UnauthorizedError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { getDtdcTracking } from "@/modules/shipping";

export const GET = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("You must be logged in to view tracking");
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    throw new NotFoundError("Order");
  }

  // Allow access if owner or if user is staff/admin
  if (order.userId !== user.id) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: { role: true },
    });

    if (profile?.role !== "admin" && profile?.role !== "staff") {
      throw new UnauthorizedError("Access denied");
    }
  }

  if (!order.awbNumber) {
    return NextResponse.json({
      success: true,
      hasAwb: false,
      status: order.status,
      checkpoints: [],
    });
  }

  const tracking = await getDtdcTracking(order.awbNumber);

  return NextResponse.json({
    success: true,
    hasAwb: true,
    courier: "DTDC",
    awbNumber: order.awbNumber,
    tracking,
  });
});
