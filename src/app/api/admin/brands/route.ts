import { NextResponse } from "next/server";

import { assertAdmin } from "@/lib/admin-auth";
import { withErrorHandling } from "@/lib/errors";

import { getAdminBrands } from "@/modules/admin/catalog";

export const GET = withErrorHandling(async () => {
  await assertAdmin();

  const brands = await getAdminBrands();

  return NextResponse.json({ brands });
});
