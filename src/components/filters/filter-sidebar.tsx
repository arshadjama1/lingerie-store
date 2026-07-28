"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { RotateCcw } from "lucide-react";

import { buildQueryString, cn } from "@/lib/utils";

interface FilterSidebarProps {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: Array<{ slug: string; name: string }>;
  priceRange: { min: number; max: number };
  className?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function FilterSidebar({
  sizes,
  colors,
  brands,
  priceRange,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filter state from URL
  const selectedSizes = searchParams.getAll("size");
  const selectedColors = searchParams.getAll("color");
  const selectedBrands = searchParams.getAll("brand");
  const selectedSort = searchParams.get("sort") ?? "newest";
  const currentPriceMin = searchParams.get("priceMin");
  const currentPriceMax = searchParams.get("priceMax");

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedBrands.length > 0 ||
    currentPriceMin !== null ||
    currentPriceMax !== null;

  // Generic toggle helper
  const toggle = useCallback(
    (param: string, value: string) => {
      const current = searchParams.getAll(param);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const params: Record<string, string | string[] | undefined> = {};
      for (const key of ["sort", "priceMin", "priceMax"]) {
        const v = searchParams.get(key);
        if (v) params[key] = v;
      }
      for (const key of ["size", "color", "brand"]) {
        const vals = key === param ? next : searchParams.getAll(key);
        if (vals.length) params[key] = vals;
      }
      params.page = undefined;

      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setSort = useCallback(
    (value: string) => {
      const params: Record<string, string | string[] | undefined> = {
        sort: value,
      };
      for (const key of ["priceMin", "priceMax"]) {
        const v = searchParams.get(key);
        if (v) params[key] = v;
      }
      for (const key of ["size", "color", "brand"]) {
        const vals = searchParams.getAll(key);
        if (vals.length) params[key] = vals;
      }
      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      const params: Record<string, string | string[] | undefined> = {};
      if (searchParams.get("sort")) params.sort = searchParams.get("sort")!;
      for (const key of ["size", "color", "brand"]) {
        const vals = searchParams.getAll(key);
        if (vals.length) params[key] = vals;
      }
      if (min !== undefined) params.priceMin = String(min);
      if (max !== undefined) params.priceMax = String(max);
      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return (
    <aside
      className={cn(
        "flex flex-col gap-6 rounded-none border border-gray-100 bg-white p-5 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="font-serif text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
          Refine Selection
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[var(--accent)] transition-colors hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sort by">
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={selectedSort === opt.value}
                onChange={() => setSort(opt.value)}
                className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-[var(--accent)]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price range (₹)">
        <div className="flex items-center gap-2">
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
            className="w-full rounded-none border border-gray-200 bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
            aria-label="Minimum price"
          />
          <span className="shrink-0 text-xs font-bold text-gray-400">—</span>
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
            className="w-full rounded-none border border-gray-200 bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
            aria-label="Maximum price"
          />
        </div>
      </FilterSection>

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggle("size", size)}
                  className={cn(
                    "cursor-pointer rounded-none border px-3 py-1.5 text-xs font-bold transition-all",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  )}
                  aria-pressed={active}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <FilterSection title="Colour">
          <div className="flex flex-wrap gap-1.5">
            {colors.map(({ name, hex }) => {
              const active = selectedColors.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggle("color", name)}
                  title={name}
                  aria-pressed={active}
                  aria-label={name}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs font-semibold transition-all",
                    active
                      ? "border-[var(--accent)] bg-pink-50 text-[var(--accent)]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  )}
                >
                  {hex && (
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
                      style={{ background: hex }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2">
            {brands.map((brand) => {
              const active = selectedBrands.includes(brand.slug);
              return (
                <label
                  key={brand.slug}
                  className="group flex cursor-pointer items-center gap-2.5"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggle("brand", brand.slug)}
                    className="h-4 w-4 cursor-pointer rounded-none accent-[var(--accent)]"
                  />
                  <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-[var(--accent)]">
                    {brand.name}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <h3 className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}
