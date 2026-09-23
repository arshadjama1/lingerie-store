import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/admin-auth";
import { withErrorHandling } from "@/lib/errors";

import { listAdminReviews } from "@/modules/reviews";

export const GET = withErrorHandling(async (req: Request) => {
  await assertAdmin();

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "approved" || statusParam === "pending"
      ? statusParam
      : "pending";

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Number(searchParams.get("limit") ?? "20"));

  const result = await listAdminReviews({ status, page, limit });

  return NextResponse.json(result);
});
