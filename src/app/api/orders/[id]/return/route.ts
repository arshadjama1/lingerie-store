import { NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { createReturnRequest } from "@/modules/orders";

const returnSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide at least 10 characters for the reason"),
});

export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
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

  const body = await req.json().catch(() => ({}));
  const result = returnSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid return request"
    );
  }

  const response = await createReturnRequest(
    orderId,
    user.id,
    result.data.reason
  );

  return NextResponse.json(response, { status: 201 });
});
