"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { buildQueryString, cn } from "@/lib/utils";

export interface SearchCategoryFacet {
  id: string;
  name: string;
  slug: string;
}

interface SearchFilterSidebarProps {
  priceRange: { min: number; max: number };
  categories?: SearchCategoryFacet[];
  className?: string;
}

export function SearchFilterSidebar({
  priceRange,
  categories = [],
  className,
}: SearchFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort");
  const currentPriceMin = searchParams.get("priceMin");
  const currentPriceMax = searchParams.get("priceMax");

  const hasActiveFilters =
    currentPriceMin !== null ||
    currentPriceMax !== null ||
    Boolean(currentCategory);

  const setCategory = useCallback(
    (slug?: string) => {
      const params: Record<string, string | undefined> = {
        q: q || undefined,
        sort: currentSort || undefined,
        priceMin: currentPriceMin || undefined,
        priceMax: currentPriceMax || undefined,
      };
      if (slug) params.category = slug;
      params.page = undefined;
      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [q, currentSort, currentPriceMin, currentPriceMax, pathname, router]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      const params: Record<string, string | undefined> = {
        q: q || undefined,
        sort: currentSort || undefined,
        category: currentCategory || undefined,
      };
      if (min !== undefined) params.priceMin = String(min);
      if (max !== undefined) params.priceMax = String(max);
      params.page = undefined;
      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [q, currentSort, currentCategory, pathname, router]
  );

  const clearFilters = useCallback(() => {
    const params: Record<string, string | undefined> = {
      q: q || undefined,
      sort: currentSort || undefined,
    };
    router.push(`${pathname}${buildQueryString(params)}`, {
      scroll: false,
    });
  }, [q, currentSort, pathname, router]);

  const categoryFacetContent = categories && categories.length > 0 && (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setCategory(undefined)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-semibold transition-colors",
          !currentCategory
            ? "bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <span>All Categories</span>
        {!currentCategory && <span className="text-[10px]">●</span>}
      </button>
      {categories.map((cat) => {
        const isSelected = currentCategory === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(isSelected ? undefined : cat.slug)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-xs px-2.5 py-1.5 text-xs font-semibold transition-colors",
              isSelected
                ? "bg-[var(--accent-subtle)] font-bold text-[var(--accent)]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span>{cat.name}</span>
            {isSelected && <span className="text-[10px]">●</span>}
          </button>
        );
      })}
    </div>
  );

  const priceInputContent = (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-gray-400">
          ₹
        </span>
        <input
          type="number"
          placeholder={String(priceRange.min)}
          defaultValue={currentPriceMin ?? ""}
          min={priceRange.min}
          max={priceRange.max}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val))
              setPriceRange(
                val,
                currentPriceMax ? parseInt(currentPriceMax) : undefined
              );
          }}
          className="w-full rounded-none border border-gray-200 bg-[var(--surface)] py-2 pr-3 pl-6 text-xs font-semibold text-gray-900 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
          aria-label="Minimum price"
        />
      </div>
      <span className="shrink-0 text-xs font-bold text-gray-400">—</span>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-gray-400">
          ₹
        </span>
        <input
          type="number"
          placeholder={String(priceRange.max)}
          defaultValue={currentPriceMax ?? ""}
          min={priceRange.min}
          max={priceRange.max}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val))
              setPriceRange(
                currentPriceMin ? parseInt(currentPriceMin) : undefined,
                val
              );
          }}
          className="w-full rounded-none border border-gray-200 bg-[var(--surface)] py-2 pr-3 pl-6 text-xs font-semibold text-gray-900 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
          aria-label="Maximum price"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Filter Accordion Bar (lg:hidden) ─────────── */}
      <div className="mb-4 lg:hidden">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-gray-800 active:text-[var(--accent)]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
            <span>Filter Results</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-black text-[var(--accent)]">
                Active
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-1 text-xs font-bold text-gray-400"
              aria-label="Toggle filter"
            >
              {mobileOpen ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-2 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {categories.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  Categories
                </p>
                {categoryFacetContent}
              </div>
            )}
            <div>
              <p className="mb-2 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                Price Range (₹)
              </p>
              {priceInputContent}
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop Sidebar (hidden lg:flex) ───────────────── */}
      <aside
        className={cn(
          "hidden flex-col gap-6 rounded-none border border-gray-100 bg-white p-5 shadow-sm lg:flex",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-serif text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
            Filter Results
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[var(--accent)] transition-colors hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Category Facet */}
        {categories.length > 0 && (
          <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <h3 className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
              Category
            </h3>
            {categoryFacetContent}
          </div>
        )}

        {/* Price range */}
        <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
          <h3 className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
            Price range (₹)
          </h3>
          {priceInputContent}
        </div>
      </aside>
    </>
  );
}
