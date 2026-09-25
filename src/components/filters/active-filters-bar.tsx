"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { RotateCcw, X } from "lucide-react";

import { buildQueryString } from "@/lib/utils";

interface ActiveFiltersBarProps {
  className?: string;
}

export function ActiveFiltersBar({ className }: ActiveFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parseList = useCallback(
    (param: string): string[] => {
      return searchParams
        .getAll(param)
        .flatMap((v) => v.split(","))
        .map((s) => s.trim())
        .filter(Boolean);
    },
    [searchParams]
  );

  const selectedSizes = useMemo(() => parseList("size"), [parseList]);
  const selectedColors = useMemo(() => parseList("color"), [parseList]);

  const currentPriceMin = searchParams.get("priceMin");
  const currentPriceMax = searchParams.get("priceMax");

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    Boolean(currentPriceMin) ||
    Boolean(currentPriceMax);

  const removeFilter = useCallback(
    (param: "size" | "color" | "price", valueToRemove?: string) => {
      const p: Record<string, string | string[] | undefined> = {};

      const sort = searchParams.get("sort");
      if (sort) p.sort = sort;

      // Handle multi-select parameters
      for (const key of ["size", "color"] as const) {
        const values = parseList(key);
        if (key === param && valueToRemove) {
          const lower = valueToRemove.toLowerCase();
          const next = values.filter((v) => v.toLowerCase() !== lower);
          if (next.length > 0) p[key] = Array.from(new Set(next));
        } else if (values.length > 0) {
          p[key] = Array.from(new Set(values));
        }
      }

      // Handle price
      if (param !== "price") {
        if (currentPriceMin !== null && currentPriceMin !== "") {
          p.priceMin = currentPriceMin;
        }
        if (currentPriceMax !== null && currentPriceMax !== "") {
          p.priceMax = currentPriceMax;
        }
      }

      p.page = undefined;
      router.push(`${pathname}${buildQueryString(p)}`, { scroll: false });
    },
    [
      searchParams,
      pathname,
      router,
      parseList,
      currentPriceMin,
      currentPriceMax,
    ]
  );

  const clearAll = useCallback(() => {
    const p: Record<string, string | undefined> = {};
    const sort = searchParams.get("sort");
    if (sort) p.sort = sort;
    router.push(`${pathname}${buildQueryString(p)}`, { scroll: false });
  }, [pathname, router, searchParams]);

  if (!hasActiveFilters) return null;

  // Format price chip label
  const getPriceLabel = () => {
    if (currentPriceMin && currentPriceMax) {
      return `Price: ₹${currentPriceMin} – ₹${currentPriceMax}`;
    }
    if (currentPriceMin) {
      return `Price: ₹${currentPriceMin} & Above`;
    }
    if (currentPriceMax) {
      return `Price: Under ₹${currentPriceMax}`;
    }
    return "Price";
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 py-3 ${className || ""}`}
    >
      <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
        Active Filters:
      </span>

      {/* Sizes */}
      {selectedSizes.map((size) => (
        <button
          key={`size-${size}`}
          type="button"
          onClick={() => removeFilter("size", size)}
          className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-[var(--accent)]"
        >
          <span>Size: {size}</span>
          <X className="h-3 w-3 text-stone-400 group-hover:text-[var(--accent)]" />
        </button>
      ))}

      {/* Colors */}
      {selectedColors.map((color) => (
        <button
          key={`color-${color}`}
          type="button"
          onClick={() => removeFilter("color", color)}
          className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-[var(--accent)]"
        >
          <span>Color: {color}</span>
          <X className="h-3 w-3 text-stone-400 group-hover:text-[var(--accent)]" />
        </button>
      ))}

      {/* Price */}
      {(currentPriceMin || currentPriceMax) && (
        <button
          type="button"
          onClick={() => removeFilter("price")}
          className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-[var(--accent)]"
        >
          <span>{getPriceLabel()}</span>
          <X className="h-3 w-3 text-stone-400 group-hover:text-[var(--accent)]" />
        </button>
      )}

      {/* Clear All Button */}
      <button
        type="button"
        onClick={clearAll}
        className="flex cursor-pointer items-center gap-1 px-2 py-1 text-xs font-bold text-[var(--accent)] underline underline-offset-4 transition-colors hover:text-[var(--accent-dark)]"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
