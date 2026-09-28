import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { placeCodOrder } from "@/modules/payments";

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

  const order = await placeCodOrder({
    checkoutSessionId: result.data.checkoutSessionId,
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
  });
});
