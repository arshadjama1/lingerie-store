"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Flame,
  Loader2,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

import type { SearchSuggestionsResult } from "@/modules/catalog";

interface SearchAutocompleteProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSelect?: () => void;
  autoFocus?: boolean;
}

const TRENDING_SEARCHES = [
  "T-Shirt Bra",
  "Seamless Panty",
  "Lace Bralette",
  "Bamboo Loungewear",
  "Padded Wirefree Bra",
  "Bridal Nightwear",
];

const POPULAR_CATEGORIES = [
  { name: "Bras", href: "/bras" },
  { name: "Panties", href: "/panties" },
  { name: "Nightwear", href: "/nightwear" },
  { name: "Shapewear", href: "/shapewear" },
  { name: "Sale", href: "/sale" },
];

export function SearchAutocomplete({
  initialQuery = "",
  placeholder = "Search bras, panties, nightwear, shapewear...",
  className,
  inputClassName,
  onSelect,
  autoFocus = false,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const [suggestions, setSuggestions] = useState<SearchSuggestionsResult>({
    query: "",
    categories: [],
    suggestions: [],
    products: [],
    totalMatches: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial query prop
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with 180ms debounce
  const fetchSuggestions = useCallback((searchStr: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchStr.trim();
    if (!trimmed) {
      setSuggestions({
        query: "",
        categories: [],
        suggestions: [],
        products: [],
        totalMatches: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data: SearchSuggestionsResult = await res.json();
          setSuggestions(data);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 180);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    fetchSuggestions(val);
  };

  const navigateTo = (url: string) => {
    setIsOpen(false);
    onSelect?.();
    router.push(url);
  };

  const submitSearch = (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (!q) return;
    navigateTo(`/search?q=${encodeURIComponent(q)}`);
  };

  // Build a flat list of actionable items for keyboard navigation
  const allNavigableItems: Array<{ type: string; href: string; text: string }> =
    [];

  if (query.trim()) {
    suggestions.categories.forEach((c) =>
      allNavigableItems.push({
        type: "category",
        href: c.href,
        text: `${c.label} in ${c.categoryName}`,
      })
    );
    suggestions.suggestions.forEach((s) =>
      allNavigableItems.push({
        type: "keyword",
        href: s.href,
        text: s.text,
      })
    );
    suggestions.products.forEach((p) =>
      allNavigableItems.push({
        type: "product",
        href: `/p/${p.slug}`,
        text: p.name,
      })
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < allNavigableItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : allNavigableItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allNavigableItems.length) {
        const item = allNavigableItems[selectedIndex];
        if (item) navigateTo(item.href);
      } else {
        submitSearch();
      }
    }
  };

  const hasResults =
    suggestions.categories.length > 0 ||
    suggestions.suggestions.length > 0 ||
    suggestions.products.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-full border border-gray-200 bg-gray-50/90 py-2.5 pr-10 pl-10 text-xs transition-all placeholder:text-gray-400 focus:border-[var(--accent)] focus:bg-white focus:ring-1 focus:ring-[var(--accent)] focus:outline-none",
            isOpen && "border-[var(--accent)] shadow-xs",
            inputClassName
          )}
        />

        {/* Left Search Icon */}
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />

        {/* Right Status / Action button */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions({
                  query: "",
                  categories: [],
                  suggestions: [],
                  products: [],
                  totalMatches: 0,
                });
                inputRef.current?.focus();
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Zivame-style Floating Autocomplete Dropdown ─────────── */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[300px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl sm:min-w-[420px]">
          {/* STATE A: User has typed a query */}
          {query.trim().length > 0 ? (
            <div className="max-h-[440px] overflow-y-auto">
              {/* 1. Scoped Category suggestions (Zivame top section) */}
              {suggestions.categories.length > 0 && (
                <div className="py-1">
                  {suggestions.categories.map((cat, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={`${cat.categoryName}-${idx}`}
                        type="button"
                        onClick={() => navigateTo(cat.href)}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-xs transition-colors sm:text-sm",
                          isSelected
                            ? "bg-pink-50/80 text-[var(--accent)]"
                            : "hover:bg-pink-50/50"
                        )}
                      >
                        <span className="truncate text-gray-800">
                          <HighlightMatch text={cat.label} query={query} />
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-gray-400 sm:text-xs">
                          <span>in</span>
                          <span className="font-extrabold tracking-wider text-[var(--accent)] uppercase">
                            {cat.categoryName}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Keyword suggestions (Zivame middle section) */}
              {suggestions.suggestions.length > 0 && (
                <div className="border-t border-gray-100/80 py-1">
                  {suggestions.suggestions.map((item, idx) => {
                    const globalIdx = suggestions.categories.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => navigateTo(item.href)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors sm:text-sm",
                          isSelected
                            ? "bg-pink-50/80 text-[var(--accent)]"
                            : "hover:bg-pink-50/50"
                        )}
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate text-gray-800">
                          <HighlightMatch text={item.text} query={query} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Top Product Previews (Rich card previews) */}
              {suggestions.products.length > 0 && (
                <div className="border-t border-gray-100/90 bg-gray-50/40 p-3">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      Top Matches
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {suggestions.totalMatches} found
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {suggestions.products.map((product, idx) => {
                      const globalIdx =
                        suggestions.categories.length +
                        suggestions.suggestions.length +
                        idx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <Link
                          key={product.id}
                          href={`/p/${product.slug}`}
                          onClick={() => {
                            setIsOpen(false);
                            onSelect?.();
                          }}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border border-transparent bg-white p-2 shadow-2xs transition-all hover:border-pink-200 hover:shadow-xs",
                            isSelected && "border-[var(--accent)] bg-pink-50/40"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                            {product.primaryImage?.url ? (
                              <Image
                                src={product.primaryImage.url}
                                alt={product.primaryImage.alt ?? product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            {product.brandName && (
                              <p className="text-[9px] font-black tracking-wider text-gray-400 uppercase">
                                {product.brandName}
                              </p>
                            )}
                            <h4 className="line-clamp-1 text-xs font-semibold text-gray-900">
                              <HighlightMatch
                                text={product.name}
                                query={query}
                              />
                            </h4>
                            <div className="mt-0.5 flex items-baseline gap-1.5">
                              <span className="text-xs font-black text-gray-900">
                                {formatPrice(product.minPrice)}
                              </span>
                              {Number(product.minMrp) >
                                Number(product.minPrice) && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(product.minMrp)}
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Bottom Footer: View all results */}
              <div className="border-t border-gray-100 bg-white p-2">
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[var(--surface)] py-2 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-pink-50"
                >
                  <span>
                    View all{" "}
                    {suggestions.totalMatches > 0
                      ? `${suggestions.totalMatches} `
                      : ""}
                    results for &ldquo;{query}&rdquo;
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Zero matches fallback inside dropdown */}
              {!hasResults && !isLoading && (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs font-semibold text-gray-600">
                    No instant suggestions for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Press Enter to search the full catalog
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* STATE B: Empty query (Focused state — Trending & Categories) */
            <div className="p-4">
              {/* Trending Searches */}
              <div className="mb-4">
                <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        submitSearch(term);
                      }}
                      className="cursor-pointer rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-[var(--accent)]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="border-t border-gray-100 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  <span>Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => navigateTo(cat.href)}
                      className="cursor-pointer text-xs font-bold text-gray-700 underline-offset-2 hover:text-[var(--accent)] hover:underline"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Helper to bold matching characters while preserving casing
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  // Escape special regex characters
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return (
          <span
            key={i}
            className={
              isMatch
                ? "font-extrabold text-neutral-950"
                : "font-medium text-neutral-700"
            }
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}
