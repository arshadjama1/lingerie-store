"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Search, SlidersHorizontal, X } from "lucide-react";

interface InventoryFiltersProps {
  categories: { id: string; name: string }[];
}

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
  { value: "qty_asc", label: "Stock ↑ Low first" },
  { value: "qty_desc", label: "Stock ↓ High first" },
  { value: "sku", label: "SKU A→Z" },
] as const;

export function InventoryFilters({ categories }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for the search input (debounced before URL push)
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local search in sync if URL changes externally (e.g. browser back)
  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 on any filter change
      params.delete("page");
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname, searchParams]
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ search: value || null }));
    }, 350);
  }

  function handleLowStockToggle() {
    const current = searchParams.get("lowStockOnly") === "true";
    router.push(buildUrl({ lowStockOnly: current ? null : "true" }));
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ categoryId: e.target.value || null }));
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ sort: e.target.value || null }));
  }

  function handleClearFilters() {
    setSearchValue("");
    router.push(pathname);
  }

  const hasActiveFilters =
    searchParams.has("search") ||
    searchParams.has("lowStockOnly") ||
    searchParams.has("categoryId") ||
    (searchParams.has("sort") && searchParams.get("sort") !== "name_asc");

  const isLowStockActive = searchParams.get("lowStockOnly") === "true";
  const selectedCategory = searchParams.get("categoryId") ?? "";
  const selectedSort = searchParams.get("sort") ?? "name_asc";

  return (
    <div className="rounded-none border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search product, SKU, colour…"
            value={searchValue}
            onChange={handleSearchChange}
            className="h-9 w-full rounded-none border border-gray-200 bg-white pr-3 pl-9 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#3d0a20] focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Low stock toggle */}
        <button
          type="button"
          onClick={handleLowStockToggle}
          className={`flex h-9 items-center gap-1.5 rounded-none border px-3 text-xs font-semibold transition-colors ${
            isLowStockActive
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Low Stock Only
        </button>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="h-9 rounded-none border border-gray-200 bg-white px-2 pr-8 text-xs text-gray-700 focus:border-[#3d0a20] focus:ring-0 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={selectedSort}
          onChange={handleSortChange}
          className="h-9 rounded-none border border-gray-200 bg-white px-2 pr-8 text-xs text-gray-700 focus:border-[#3d0a20] focus:ring-0 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex h-9 items-center gap-1 rounded-none border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-600"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
