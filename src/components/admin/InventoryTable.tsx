"use client";

import { useState } from "react";

import { AlertTriangle, Package } from "lucide-react";

import { buildQueryString, formatPrice } from "@/lib/utils";

import type { InventoryListItem } from "@/modules/admin/inventory";

import { Pagination } from "@/components/common/pagination";

import { InventoryStockEditor } from "./InventoryStockEditor";

interface InventoryTableProps {
  items: InventoryListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  // Serialisable filter values — the table builds its own pagination URLs.
  // Never pass a function from a Server Component to a Client Component.
  filterSearch?: string;
  filterLowStockOnly?: boolean;
  filterCategoryId?: string;
  filterSort?: string;
}

export function InventoryTable({
  items,
  total,
  currentPage,
  totalPages,
  filterSearch,
  filterLowStockOnly,
  filterCategoryId,
  filterSort,
}: InventoryTableProps) {
  // Track which row's editor is open (by variantId)
  const [openEditorId, setOpenEditorId] = useState<string | null>(null);

  function buildUrl(page: number) {
    return (
      "/admin/inventory" +
      buildQueryString({
        search: filterSearch || undefined,
        lowStockOnly: filterLowStockOnly ? "true" : undefined,
        categoryId: filterCategoryId || undefined,
        sort: filterSort && filterSort !== "name_asc" ? filterSort : undefined,
        page,
      })
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-gray-200 bg-white py-20 text-center">
        <Package className="h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          No inventory records match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Row count */}
      <p className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">{items.length}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span> variant
        {total !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-none border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product",
                  "SKU",
                  "Size / Colour",
                  "Price",
                  "Stock",
                  "Reserved",
                  "Available",
                  "Alert ≤",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const isEditing = openEditorId === item.variantId;

                return (
                  <tr
                    key={item.variantId}
                    className={`transition-colors hover:bg-gray-50 ${
                      item.isLowStock ? "border-l-2 border-l-amber-400" : ""
                    }`}
                  >
                    {/* Product */}
                    <td className="max-w-[200px] px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate font-semibold text-gray-900">
                          {item.productName}
                        </span>
                        {item.categoryName && (
                          <span className="truncate text-[10px] text-gray-400">
                            {item.categoryName}
                          </span>
                        )}
                        {!item.variantIsActive && (
                          <span className="w-fit rounded bg-gray-100 px-1 py-0.5 text-[9px] font-semibold text-gray-400 uppercase">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-gray-700">
                        {item.sku}
                      </span>
                    </td>

                    {/* Size / Colour */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {item.size && (
                          <span className="text-gray-700">{item.size}</span>
                        )}
                        {item.color && (
                          <span className="flex items-center gap-1 text-gray-600">
                            {item.colorHex && (
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            {item.color}
                          </span>
                        )}
                        {!item.size && !item.color && (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.mrp !== item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(item.mrp)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock (quantity) — highlighted red/amber when low */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.isLowStock && (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                        <span
                          className={`font-bold ${
                            item.quantity === 0
                              ? "text-rose-600"
                              : item.isLowStock
                                ? "text-amber-700"
                                : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </div>
                    </td>

                    {/* Reserved */}
                    <td className="px-4 py-3 text-gray-600">
                      {item.reservedQuantity}
                    </td>

                    {/* Available */}
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          item.available === 0
                            ? "text-rose-500"
                            : "text-emerald-700"
                        }`}
                      >
                        {item.available}
                      </span>
                    </td>

                    {/* Alert threshold */}
                    <td className="px-4 py-3 text-gray-600">
                      {item.lowStockAlert}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <InventoryStockEditor
                        variantId={item.variantId}
                        currentQuantity={item.quantity}
                        currentLowStockAlert={item.lowStockAlert}
                        isOpen={isEditing}
                        onOpen={() => setOpenEditorId(item.variantId)}
                        onClose={() => setOpenEditorId(null)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildUrl={buildUrl}
      />
    </div>
  );
}
