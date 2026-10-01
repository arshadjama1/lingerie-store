"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";

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

const PRICE_PRESETS = [
  { label: "Under ₹400", min: undefined, max: 400 },
  { label: "₹400 – ₹700", min: 400, max: 700 },
  { label: "₹700 & Above", min: 700, max: undefined },
];

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

  // Active category display name
  const activeCategoryName = categories.find(
    (c) => c.slug === currentCategory
  )?.name;

  const categoryFacetContent = categories && categories.length > 0 && (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setCategory(undefined)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all",
          !currentCategory
            ? "bg-rose-50 font-bold text-[var(--accent)] shadow-2xs"
            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
        )}
      >
        <span>All Categories</span>
        {!currentCategory && (
          <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
        )}
      </button>

      {categories.map((cat) => {
        const isSelected = currentCategory === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(isSelected ? undefined : cat.slug)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all",
              isSelected
                ? "bg-rose-50 font-bold text-[var(--accent)] shadow-2xs"
                : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <span>{cat.name}</span>
            {isSelected && (
              <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );

  const pricePresetContent = (
    <div className="flex flex-wrap gap-1.5 pb-2">
      {PRICE_PRESETS.map((preset) => {
        const isSelected =
          (preset.min === undefined ||
            Number(currentPriceMin) === preset.min) &&
          (preset.max === undefined || Number(currentPriceMax) === preset.max);

        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              if (isSelected) {
                setPriceRange(undefined, undefined);
              } else {
                setPriceRange(preset.min, preset.max);
              }
            }}
            className={cn(
              "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95",
              isSelected
                ? "border-[var(--accent)] bg-rose-50 font-bold text-[var(--accent)] shadow-2xs"
                : "border-gray-200 bg-white text-neutral-700 hover:border-gray-300 hover:bg-neutral-50"
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );

  const priceInputContent = (
    <div className="space-y-3">
      {pricePresetContent}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-gray-400">
            ₹
          </span>
          <input
            type="number"
            placeholder={String(priceRange.min)}
            value={currentPriceMin ?? ""}
            min={priceRange.min}
            max={priceRange.max}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              setPriceRange(
                val,
                currentPriceMax ? parseInt(currentPriceMax) : undefined
              );
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pr-2.5 pl-6 text-xs font-semibold text-gray-900 transition-colors focus:border-[var(--accent)] focus:bg-white focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
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
            value={currentPriceMax ?? ""}
            min={priceRange.min}
            max={priceRange.max}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              setPriceRange(
                currentPriceMin ? parseInt(currentPriceMin) : undefined,
                val
              );
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pr-2.5 pl-6 text-xs font-semibold text-gray-900 transition-colors focus:border-[var(--accent)] focus:bg-white focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
            aria-label="Maximum price"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Filter Accordion Bar (lg:hidden) ─────────── */}
      <div className="mb-4 lg:hidden">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-gray-800 active:text-[var(--accent)]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" />
            <span>Filter Results</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-[var(--accent)]">
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
          <div className="mt-2 space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Active Pills in Mobile */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-3">
                {activeCategoryName && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                    Category: {activeCategoryName}
                    <button
                      type="button"
                      onClick={() => setCategory(undefined)}
                      className="hover:opacity-75"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(currentPriceMin !== null || currentPriceMax !== null) && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                    Price: ₹{currentPriceMin ?? 0} – ₹{currentPriceMax ?? "Any"}
                    <button
                      type="button"
                      onClick={() => setPriceRange(undefined, undefined)}
                      className="hover:opacity-75"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {categories.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                  Categories
                </p>
                {categoryFacetContent}
              </div>
            )}
            <div>
              <p className="mb-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
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
          "hidden flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:flex",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
            <h2 className="font-serif text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
              Filter Results
            </h2>
          </div>
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

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-4">
            {activeCategoryName && (
              <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">
                {activeCategoryName}
                <button
                  type="button"
                  onClick={() => setCategory(undefined)}
                  className="cursor-pointer hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(currentPriceMin !== null || currentPriceMax !== null) && (
              <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">
                ₹{currentPriceMin ?? 0} – ₹{currentPriceMax ?? "Any"}
                <button
                  type="button"
                  onClick={() => setPriceRange(undefined, undefined)}
                  className="cursor-pointer hover:opacity-75"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Category Facet */}
        {categories.length > 0 && (
          <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
            <h3 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
              Category
            </h3>
            {categoryFacetContent}
          </div>
        )}

        {/* Price range */}
        <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
          <h3 className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
            Price range (₹)
          </h3>
          {priceInputContent}
        </div>
      </aside>
    </>
  );
}
