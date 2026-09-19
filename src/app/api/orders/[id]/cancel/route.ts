import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { cancelOrder } from "@/modules/orders";

export const POST = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  if (!orderId) {
    throw new ValidationError("Order ID is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const result = await cancelOrder(orderId, user.id);

  return NextResponse.json(result);
});
