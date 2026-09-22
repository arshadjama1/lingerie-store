import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/admin-auth";
import { ValidationError, withErrorHandling } from "@/lib/errors";

import {
  createCoupon,
  createCouponSchema,
  listCoupons,
} from "@/modules/coupons";

export const GET = withErrorHandling(async () => {
  await assertAdmin();
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
});

export const POST = withErrorHandling(async (req: Request) => {
  await assertAdmin();

  const body = await req.json().catch(() => ({}));
  const result = createCouponSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid coupon data"
    );
  }

  const coupon = await createCoupon(result.data);
  return NextResponse.json({ coupon }, { status: 201 });
});
