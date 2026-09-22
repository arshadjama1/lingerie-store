import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { validateCoupon } from "@/modules/coupons";

const bodySchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  cartSubtotal: z.number().positive("Cart subtotal must be positive"),
});

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await req.json().catch(() => ({}));
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid request body"
    );
  }

  const { code, cartSubtotal } = result.data;

  const validated = await validateCoupon(code, user.id, cartSubtotal);

  return NextResponse.json(validated);
});
