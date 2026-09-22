import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { validateCoupon } from "@/modules/coupons";

const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  cartSubtotal: z.number().nonnegative("Subtotal must be non-negative"),
});

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Please sign in to apply coupons");
  }

  const body = await req.json().catch(() => ({}));
  const result = validateCouponSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid coupon data"
    );
  }

  try {
    const validated = await validateCoupon(
      result.data.code,
      user.id,
      result.data.cartSubtotal
    );

    return NextResponse.json({
      valid: true,
      coupon: validated,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to apply coupon";
    return NextResponse.json(
      {
        valid: false,
        error: errorMsg,
      },
      { status: 400 }
    );
  }
});
