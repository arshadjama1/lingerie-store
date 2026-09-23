import { type NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { createReview, fitFeedbackSchema } from "@/modules/reviews";

const requestBodySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().min(1, "Order ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .trim()
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  body: z
    .string()
    .trim()
    .max(2000, "Review body cannot exceed 2000 characters")
    .optional(),
  fitFeedback: fitFeedbackSchema.optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  let rawBody: unknown;
  try {
    rawBody = await (req as NextRequest).json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const parsed = requestBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid review input"
    );
  }

  const review = await createReview({
    ...parsed.data,
    userId: user.id,
  });

  return NextResponse.json({ review: { id: review.id } }, { status: 201 });
});
