import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { createCheckoutSession, getCheckoutSession } from "@/modules/checkout";

const createSessionSchema = z.object({
  cartId: z.string().min(1, "Cart ID is required"),
  addressId: z.string().min(1, "Address ID is required"),
  couponCode: z.string().optional(),
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
  const result = createSessionSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid checkout payload"
    );
  }

  const session = await createCheckoutSession({
    userId: user.id,
    cartId: result.data.cartId,
    addressId: result.data.addressId,
    couponCode: result.data.couponCode,
  });

  return NextResponse.json({ session }, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    throw new ValidationError("sessionId parameter is required");
  }

  const session = await getCheckoutSession(sessionId, user.id);

  return NextResponse.json({ session });
});
