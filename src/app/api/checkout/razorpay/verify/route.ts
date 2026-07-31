import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { processPaymentSuccess } from "@/modules/payments";

const verifySchema = z.object({
  checkoutSessionId: z.string().min(1, "Checkout session ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
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
  const result = verifySchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid verification payload"
    );
  }

  const resultOrder = await processPaymentSuccess({
    checkoutSessionId: result.data.checkoutSessionId,
    razorpayOrderId: result.data.razorpayOrderId,
    razorpayPaymentId: result.data.razorpayPaymentId,
    razorpaySignature: result.data.razorpaySignature,
  });

  return NextResponse.json({
    success: true,
    orderId: resultOrder.orderId,
    orderNumber: resultOrder.orderNumber,
  });
});
