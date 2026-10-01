import Link from "next/link";

import { AlertTriangle, Boxes } from "lucide-react";

import type { InventorySortOption } from "@/modules/admin/inventory";
import { listInventory } from "@/modules/admin/inventory/queries";
import { getCatalogCategories } from "@/modules/catalog";
import type { CategoryNode } from "@/modules/catalog";

import { InventoryFilters } from "@/components/admin/InventoryFilters";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";

const VALID_SORTS: InventorySortOption[] = [
  "name_asc",
  "name_desc",
  "qty_asc",
  "qty_desc",
  "sku",
];

interface PageProps {
  searchParams: Promise<{
    search?: string;
    lowStockOnly?: string;
    categoryId?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const {
    search,
    lowStockOnly: lowStockOnlyParam,
    categoryId,
    sort: sortParam,
    page: pageParam,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const lowStockOnly = lowStockOnlyParam === "true";
  const sort = VALID_SORTS.includes(sortParam as InventorySortOption)
    ? (sortParam as InventorySortOption)
    : "name_asc";

  const [result, categoryTree] = await Promise.all([
    listInventory({
      search: search?.trim() || undefined,
      lowStockOnly,
      categoryId: categoryId || undefined,
      sort,
      page,
      limit: 50,
    }),
    getCatalogCategories(),
  ]);

  // Flatten category tree to a flat list for the filter dropdown
  function flattenCategories(nodes: CategoryNode[]): {
    id: string;
    name: string;
  }[] {
    return nodes.flatMap((node) => [
      { id: node.id, name: node.name },
      ...flattenCategories(node.children ?? []),
    ]);
  }

  const flatCategories = flattenCategories(categoryTree);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-[#3d0a20]" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Inventory Hub
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Monitor stock levels, update quantities, and manage restock
            thresholds across all product variants.
          </p>
        </div>

        {/* Low-stock badge */}
        {result.lowStockCount > 0 && (
          <Link
            href="/admin/inventory?lowStockOnly=true"
            className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            {result.lowStockCount} variant
            {result.lowStockCount !== 1 ? "s" : ""} at or below restock
            threshold
          </Link>
        )}
      </div>

      {/* Filters */}
      <InventoryFilters categories={flatCategories} />

      {/* Active low-stock-only banner */}
      {lowStockOnly && (
        <div className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          Showing only low-stock variants.{" "}
          <Link
            href="/admin/inventory"
            className="ml-auto font-semibold text-amber-700 underline"
          >
            Clear filter →
          </Link>
        </div>
      )}

      {/* Table — pass plain serialisable values, never a function */}
      <InventoryTable
        items={result.items}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        filterSearch={search || undefined}
        filterLowStockOnly={lowStockOnly || undefined}
        filterCategoryId={categoryId || undefined}
        filterSort={sort}
      />
    </div>
  );
}
