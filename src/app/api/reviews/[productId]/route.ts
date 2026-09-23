import { NextResponse } from "next/server";

import { ValidationError, withErrorHandling } from "@/lib/errors";

import { listProductReviews } from "@/modules/reviews";

export const GET = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ productId: string }> })?.params;
  const { productId } = (await params) ?? {};

  if (!productId) {
    throw new ValidationError("Product ID is required");
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") ?? "10"));

  const result = await listProductReviews(productId, page, limit);

  return NextResponse.json(result);
});
