"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { ArrowUpDown } from "lucide-react";

import { buildQueryString } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface SortDropdownProps {
  className?: string;
  options?: Array<{ value: string; label: string }>;
  defaultSort?: string;
}

export function SortDropdown({
  className,
  options = SORT_OPTIONS,
  defaultSort = "newest",
}: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || defaultSort;

  const setSort = useCallback(
    (value: string) => {
      const params: Record<string, string | string[] | undefined> = {};
      params.sort = value;

      const q = searchParams.get("q");
      if (q) params.q = q;

      const category = searchParams.get("category");
      if (category) params.category = category;

      const currentPriceMin = searchParams.get("priceMin");
      const currentPriceMax = searchParams.get("priceMax");
      if (currentPriceMin !== null && currentPriceMin !== "") {
        params.priceMin = currentPriceMin;
      }
      if (currentPriceMax !== null && currentPriceMax !== "") {
        params.priceMax = currentPriceMax;
      }

      for (const key of ["size", "color", "brand"]) {
        const vals = searchParams
          .getAll(key)
          .flatMap((v) => v.split(","))
          .map((s) => s.trim())
          .filter(Boolean);
        if (vals.length) params[key] = Array.from(new Set(vals));
      }
      params.page = undefined;

      router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className={`flex items-center gap-1.5 ${className || ""}`}>
      <span className="hidden text-xs font-semibold whitespace-nowrap text-stone-500 sm:inline-block">
        Sort by:
      </span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 cursor-pointer appearance-none rounded-xs border border-stone-200 bg-white py-1.5 pr-8 pl-3 text-xs font-semibold text-stone-800 shadow-xs transition-colors hover:border-stone-400 focus:border-stone-900 focus:outline-none"
          aria-label="Sort products by"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 text-stone-400" />
      </div>
    </div>
  );
}
