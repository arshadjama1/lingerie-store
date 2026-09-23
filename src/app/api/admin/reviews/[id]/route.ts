import { type NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { ValidationError, withErrorHandling } from "@/lib/errors";

import { approveReview, rejectReview } from "@/modules/reviews";

const patchBodySchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  await assertAdmin();

  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id } = (await params) ?? {};

  if (!id) {
    throw new ValidationError("Review ID is required");
  }

  let rawBody: unknown;
  try {
    rawBody = await (req as NextRequest).json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const parsed = patchBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ??
        "Invalid action. Must be 'approve' or 'reject'."
    );
  }

  const { action } = parsed.data;

  if (action === "approve") {
    await approveReview(id);
    return NextResponse.json({ success: true, message: "Review approved" });
  } else {
    await rejectReview(id);
    return NextResponse.json({
      success: true,
      message: "Review rejected and deleted",
    });
  }
});
