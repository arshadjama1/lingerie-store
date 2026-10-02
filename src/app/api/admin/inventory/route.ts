import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import type { InventorySortOption } from "@/modules/admin/inventory";
import { listInventory } from "@/modules/admin/inventory/queries";

const VALID_SORTS: InventorySortOption[] = [
  "name_asc",
  "name_desc",
  "qty_asc",
  "qty_desc",
  "sku",
];

export async function GET(request: NextRequest) {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") ?? undefined;
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const sortParam = searchParams.get("sort") ?? undefined;
  const sort = VALID_SORTS.includes(sortParam as InventorySortOption)
    ? (sortParam as InventorySortOption)
    : "name_asc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10))
  );

  const result = await listInventory({
    search,
    lowStockOnly,
    categoryId,
    sort,
    page,
    limit,
  });

  return NextResponse.json(result);
}
