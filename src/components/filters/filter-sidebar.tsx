"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { X } from "lucide-react";

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

  // Generic toggle helper — adds or removes a value from a multi-select param
  const toggle = useCallback(
    (param: string, value: string) => {
      const current = searchParams.getAll(param);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      // Rebuild the full query string from current params, replacing the toggled one
      const params: Record<string, string | string[] | undefined> = {};
      for (const key of ["sort", "priceMin", "priceMax"]) {
        const v = searchParams.get(key);
        if (v) params[key] = v;
      }
      for (const key of ["size", "color", "brand"]) {
        const vals = key === param ? next : searchParams.getAll(key);
        if (vals.length) params[key] = vals;
      }
      params.page = undefined; // reset to page 1 on filter change

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
    <aside className={cn("flex flex-col gap-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-foreground-muted hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sort by">
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={selectedSort === opt.value}
                onChange={() => setSort(opt.value)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-foreground-muted text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price range">
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
            className="text-foreground w-full rounded border px-3 py-1.5 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-raised)",
            }}
            aria-label="Minimum price"
          />
          <span className="text-foreground-muted shrink-0 text-sm">to</span>
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
            className="text-foreground w-full rounded border px-3 py-1.5 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-raised)",
            }}
            aria-label="Maximum price"
          />
        </div>
      </FilterSection>

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggle("size", size)}
                  className={cn(
                    "rounded border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent-dark)]"
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
          <div className="flex flex-wrap gap-2">
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
                    "flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                    active
                      ? "border-[var(--accent)]"
                      : "border-[var(--border)] hover:border-[var(--foreground-muted)]"
                  )}
                >
                  {hex && (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ background: hex }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-foreground-muted">{name}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-1.5">
            {brands.map((brand) => {
              const active = selectedBrands.includes(brand.slug);
              return (
                <label
                  key={brand.slug}
                  className="flex cursor-pointer items-center gap-2.5"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggle("brand", brand.slug)}
                    className="h-4 w-4 rounded accent-[var(--accent)]"
                  />
                  <span className="text-foreground-muted text-sm">
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
    <div className="flex flex-col gap-2.5">
      <h3 className="text-foreground text-xs font-semibold tracking-widest uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}
