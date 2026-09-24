"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

import { buildQueryString, cn } from "@/lib/utils";

interface FilterSidebarProps {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  priceRange: { min: number; max: number };
  className?: string;
}

const PRICE_PRESETS: Array<{ label: string; min: number; max?: number }> = [
  { label: "Under ₹499", min: 0, max: 499 },
  { label: "₹500 - ₹999", min: 500, max: 999 },
  { label: "₹1,000 - ₹1,499", min: 1000, max: 1499 },
  { label: "₹1,500 & Above", min: 1500, max: undefined },
];

export function FilterSidebar({
  sizes,
  colors,
  priceRange,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    size: true,
    color: true,
    price: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Parse current filter state from URL safely
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

  const rawSizes = useMemo(() => parseList("size"), [parseList]);
  const rawColors = useMemo(() => parseList("color"), [parseList]);

  const selectedSizesUpper = useMemo(
    () => rawSizes.map((s) => s.toUpperCase()),
    [rawSizes]
  );
  const selectedColorsLower = useMemo(
    () => rawColors.map((c) => c.toLowerCase()),
    [rawColors]
  );

  const currentPriceMin = searchParams.get("priceMin");
  const currentPriceMax = searchParams.get("priceMax");

  // Controlled custom price inputs
  const [localMin, setLocalMin] = useState(currentPriceMin ?? "");
  const [localMax, setLocalMax] = useState(currentPriceMax ?? "");

  useEffect(() => {
    setLocalMin(currentPriceMin ?? "");
  }, [currentPriceMin]);

  useEffect(() => {
    setLocalMax(currentPriceMax ?? "");
  }, [currentPriceMax]);

  const hasActiveFilters =
    rawSizes.length > 0 ||
    rawColors.length > 0 ||
    Boolean(currentPriceMin) ||
    Boolean(currentPriceMax);

  // Helper to push updated search params cleanly
  const updateParams = useCallback(
    (updater: (p: Record<string, string | string[] | undefined>) => void) => {
      const p: Record<string, string | string[] | undefined> = {};
      const sort = searchParams.get("sort");
      if (sort) p.sort = sort;

      if (rawSizes.length > 0) p.size = rawSizes;
      if (rawColors.length > 0) p.color = rawColors;

      if (currentPriceMin !== null && currentPriceMin !== "") {
        p.priceMin = currentPriceMin;
      }
      if (currentPriceMax !== null && currentPriceMax !== "") {
        p.priceMax = currentPriceMax;
      }

      updater(p);

      // Always reset pagination when filters change
      p.page = undefined;

      router.push(`${pathname}${buildQueryString(p)}`, { scroll: false });
    },
    [
      searchParams,
      pathname,
      router,
      rawSizes,
      rawColors,
      currentPriceMin,
      currentPriceMax,
    ]
  );

  // Toggle multi-select items (size, color)
  const toggle = useCallback(
    (param: "size" | "color", value: string) => {
      updateParams((p) => {
        const current = parseList(param);
        const lowerVal = value.toLowerCase();
        const exists = current.some((item) => item.toLowerCase() === lowerVal);

        const next = exists
          ? current.filter((item) => item.toLowerCase() !== lowerVal)
          : [...current, value];

        if (next.length > 0) {
          p[param] = Array.from(new Set(next));
        } else {
          delete p[param];
        }
      });
    },
    [parseList, updateParams]
  );

  const applyPriceRange = useCallback(
    (minStr: string, maxStr: string) => {
      updateParams((p) => {
        const minVal = minStr.trim() !== "" ? parseInt(minStr.trim(), 10) : NaN;
        const maxVal = maxStr.trim() !== "" ? parseInt(maxStr.trim(), 10) : NaN;

        if (!isNaN(minVal) && minVal >= 0) {
          p.priceMin = String(minVal);
        } else {
          delete p.priceMin;
        }

        if (!isNaN(maxVal) && maxVal > 0) {
          p.priceMax = String(maxVal);
        } else {
          delete p.priceMax;
        }
      });
    },
    [updateParams]
  );

  const clearAll = useCallback(() => {
    const p: Record<string, string | undefined> = {};
    const sort = searchParams.get("sort");
    if (sort) p.sort = sort;
    router.push(`${pathname}${buildQueryString(p)}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const isPresetActive = (min: number, max?: number) => {
    const minMatches =
      min === 0
        ? !currentPriceMin || currentPriceMin === "0"
        : currentPriceMin === String(min);
    const maxMatches =
      max === undefined ? !currentPriceMax : currentPriceMax === String(max);
    return minMatches && maxMatches;
  };

  return (
    <aside
      className={cn(
        "sticky top-24 flex flex-col gap-5 self-start rounded-none border border-stone-200/80 bg-white p-5 shadow-xs transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h2 className="font-serif text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
          Refine Selection
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[var(--accent)] transition-colors hover:text-[var(--accent-dark)] hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Sizes Section */}
      {sizes.length > 0 && (
        <div className="border-b border-stone-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection("size")}
            className="flex w-full cursor-pointer items-center justify-between text-xs font-bold tracking-wider text-stone-900 uppercase"
          >
            <span>Size</span>
            {openSections.size ? (
              <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            )}
          </button>

          {openSections.size && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sizes.map((size) => {
                const active = selectedSizesUpper.includes(size.toUpperCase());
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggle("size", size)}
                    className={cn(
                      "flex h-8 min-w-[34px] cursor-pointer items-center justify-center rounded-xs border px-2 text-xs font-bold transition-all active:scale-95",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
                    )}
                    aria-pressed={active}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Colors Section */}
      {colors.length > 0 && (
        <div className="border-b border-stone-100 pb-4">
          <button
            type="button"
            onClick={() => toggleSection("color")}
            className="flex w-full cursor-pointer items-center justify-between text-xs font-bold tracking-wider text-stone-900 uppercase"
          >
            <span>Color</span>
            {openSections.color ? (
              <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            )}
          </button>

          {openSections.color && (
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map(({ name, hex }) => {
                const active = selectedColorsLower.includes(name.toLowerCase());
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle("color", name)}
                    title={name}
                    aria-label={`Filter by ${name}`}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all active:scale-95",
                      active
                        ? "border-[var(--accent)] bg-rose-50/50 font-bold text-[var(--accent)] ring-1 ring-[var(--accent)]"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                    )}
                  >
                    {hex ? (
                      <span
                        className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      >
                        {active && (
                          <Check
                            className={cn(
                              "h-2.5 w-2.5",
                              hex.toLowerCase() === "#ffffff" ||
                                hex.toLowerCase() === "#fff"
                                ? "text-stone-900"
                                : "text-white"
                            )}
                          />
                        )}
                      </span>
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-stone-300 bg-stone-100" />
                    )}
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range Section */}
      <div className="pb-1">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full cursor-pointer items-center justify-between text-xs font-bold tracking-wider text-stone-900 uppercase"
        >
          <span>Price</span>
          {openSections.price ? (
            <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
          )}
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3">
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const isActive = isPresetActive(preset.min, preset.max);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        applyPriceRange("", "");
                      } else {
                        applyPriceRange(
                          preset.min === 0 ? "" : String(preset.min),
                          preset.max !== undefined ? String(preset.max) : ""
                        );
                      }
                    }}
                    className={cn(
                      "cursor-pointer rounded-xs border px-2 py-1 text-[11px] font-medium transition-all active:scale-95",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)] font-bold text-white shadow-xs"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyPriceRange(localMin, localMax);
              }}
              className="flex items-center gap-1.5 pt-1"
            >
              <div className="relative flex-1">
                <span className="absolute top-1.5 left-2 text-xs text-stone-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder={String(priceRange.min)}
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  min={0}
                  className="w-full rounded-xs border border-stone-200 bg-stone-50 py-1 pr-1 pl-5 text-xs font-semibold text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
                  aria-label="Minimum price"
                />
              </div>
              <span className="text-xs text-stone-400">—</span>
              <div className="relative flex-1">
                <span className="absolute top-1.5 left-2 text-xs text-stone-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder={String(priceRange.max)}
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  min={0}
                  className="w-full rounded-xs border border-stone-200 bg-stone-50 py-1 pr-1 pl-5 text-xs font-semibold text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
                  aria-label="Maximum price"
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer rounded-xs border border-stone-300 bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-800 transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
