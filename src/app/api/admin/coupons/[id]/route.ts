import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/admin-auth";
import { NotFoundError, withErrorHandling } from "@/lib/errors";

import { deactivateCoupon, listCoupons } from "@/modules/coupons";

export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  await assertAdmin();

  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id } = await params;

  // Verify coupon exists
  const coupons = await listCoupons();
  const exists = coupons.some((c) => c.id === id);
  if (!exists) {
    throw new NotFoundError("Coupon");
  }

  await deactivateCoupon(id);

  return NextResponse.json({ success: true });
});
