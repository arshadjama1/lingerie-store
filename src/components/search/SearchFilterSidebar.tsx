"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { buildQueryString } from "@/lib/utils";

interface SearchFilterSidebarProps {
  priceRange: { min: number; max: number };
  className?: string;
}

export function SearchFilterSidebar({
  priceRange,
  className,
}: SearchFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const currentPriceMin = searchParams.get("priceMin");
  const currentPriceMax = searchParams.get("priceMax");

  const hasActiveFilters = currentPriceMin !== null || currentPriceMax !== null;

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      const params: Record<string, string | undefined> = { q: q || undefined };
      if (min !== undefined) params.priceMin = String(min);
      if (max !== undefined) params.priceMax = String(max);
      params.page = undefined;
      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [q, pathname, router]
  );

  const clearFilters = useCallback(() => {
    router.push(`${pathname}${buildQueryString({ q: q || undefined })}`, {
      scroll: false,
    });
  }, [q, pathname, router]);

  return (
    <aside
      className={`flex flex-col gap-6 rounded-none border border-gray-100 bg-white p-5 shadow-sm${className ? ` ${className}` : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="font-serif text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
          Filter Results
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="cursor-pointer text-xs font-bold text-[var(--accent)] transition-colors hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
        <h3 className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
          Price range (₹)
        </h3>
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
      </div>
    </aside>
  );
}
