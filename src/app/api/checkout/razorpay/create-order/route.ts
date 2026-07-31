import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkoutSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { getCheckoutSession } from "@/modules/checkout";
import { createRazorpayOrder } from "@/modules/payments";

const schema = z.object({
  checkoutSessionId: z.string().min(1, "Checkout session ID is required"),
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
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid payload"
    );
  }

  const session = await getCheckoutSession(
    result.data.checkoutSessionId,
    user.id
  );

  // Return existing Razorpay order ID if order was already generated for this session
  if (session.razorpayOrderId) {
    return NextResponse.json({
      razorpayOrderId: session.razorpayOrderId,
      amount: Math.round(session.total * 100),
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  }

  const amountInPaise = Math.round(session.total * 100);
  const razorpayOrder = await createRazorpayOrder(amountInPaise, session.id);

  await db
    .update(checkoutSessions)
    .set({ razorpayOrderId: razorpayOrder.id })
    .where(eq(checkoutSessions.id, session.id));

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
});
