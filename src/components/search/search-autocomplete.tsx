"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Clock,
  Flame,
  Loader2,
  Package,
  Search,
  Sparkles,
  Trash2,
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
  isMobileOverlay?: boolean;
  showShortcutHint?: boolean;
  dropdownAlign?: "left" | "right";
}

const TRENDING_SEARCHES = [
  "Bamboo Fabric Bra",
  "Seamless Undies",
  "Padded Lycra Bra",
  "Overlap Bralette",
  "Lingerie Set",
  "Camisole",
];

const POPULAR_CATEGORIES = [
  { name: "Bras", href: "/bras" },
  { name: "Panties", href: "/panties" },
  { name: "Sets", href: "/sets" },
  { name: "Loungewear", href: "/loungewear" },
  { name: "Sale", href: "/sale" },
];

const RECENT_SEARCHES_KEY = "surekh_recent_searches";

export function SearchAutocomplete({
  initialQuery = "",
  placeholder = "Search bras, panties, sets, loungewear...",
  className,
  inputClassName,
  onSelect,
  autoFocus = false,
  isMobileOverlay = false,
  showShortcutHint = false,
  dropdownAlign = "left",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(isMobileOverlay);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }
  }, []);

  const saveRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [
        trimmed,
        ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage write failures (e.g. private browsing quota)
      }
      return updated;
    });
  }, []);

  const removeRecent = useCallback(
    (termToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setRecentSearches((prev) => {
        const updated = prev.filter(
          (t) => t.toLowerCase() !== termToRemove.toLowerCase()
        );
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
          // Ignore localStorage write failures
        }
        return updated;
      });
    },
    []
  );

  const clearAllRecent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore localStorage write failures
    }
  }, []);

  // Sync initial query prop or read from URL on client mount
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    } else if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get("q");
      if (urlQ) setQuery(urlQ);
    }
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

  // Global shortcut (Ctrl+K / Cmd+K) to focus search
  useEffect(() => {
    if (isMobileOverlay) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isMobileOverlay]);

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

  const navigateTo = (url: string, termToSave?: string) => {
    if (termToSave) {
      saveRecent(termToSave);
    } else if (query.trim()) {
      saveRecent(query.trim());
    }
    setIsOpen(false);
    onSelect?.();
    router.push(url);
  };

  const submitSearch = (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (!q) return;
    saveRecent(q);
    navigateTo(`/search?q=${encodeURIComponent(q)}`, q);
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
        if (item) navigateTo(item.href, item.text);
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
          type="text"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
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
            "w-full rounded-full border border-gray-200 bg-gray-50/90 py-2 pr-10 pl-10 text-sm transition-all placeholder:text-gray-400 focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15 focus:outline-none sm:text-xs [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
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
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 active:scale-95"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : showShortcutHint && !isMobileOverlay ? (
            <kbd className="pointer-events-none hidden items-center gap-0.5 rounded border border-gray-200/90 bg-gray-100/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 shadow-2xs select-none xl:inline-flex">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          ) : null}
        </div>
      </div>

      {/* ── Floating / Mobile Overlay Autocomplete Dropdown ─────────── */}
      {isOpen && (
        <div
          className={cn(
            isMobileOverlay
              ? "fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto overscroll-contain bg-white pb-16"
              : cn(
                  "absolute top-full z-50 mt-2 w-full max-w-lg min-w-0 overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-2xl backdrop-blur-xl sm:min-w-[440px]",
                  dropdownAlign === "right" ? "right-0" : "left-0"
                )
          )}
        >
          {/* STATE A: User has typed a query */}
          {query.trim().length > 0 ? (
            <div
              className={cn(
                isMobileOverlay
                  ? "divide-y divide-gray-100"
                  : "max-h-[460px] divide-y divide-gray-100/70 overflow-y-auto"
              )}
            >
              {/* 1. Scoped Category suggestions (top section) */}
              {suggestions.categories.length > 0 && (
                <div className="py-1">
                  {suggestions.categories.map((cat, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        key={`${cat.categoryName}-${idx}`}
                        type="button"
                        onClick={() => navigateTo(cat.href, cat.label)}
                        className={cn(
                          "group flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors sm:text-xs",
                          isSelected
                            ? "bg-rose-50 font-semibold text-[var(--accent)]"
                            : "hover:bg-rose-50/50 active:bg-rose-100/60"
                        )}
                      >
                        <span className="truncate text-gray-800">
                          <HighlightMatch text={cat.label} query={query} />
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-gray-400 sm:text-[11px]">
                          <span>in</span>
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 font-black tracking-wider text-[var(--accent)] uppercase">
                            {cat.categoryName}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Keyword suggestions (middle section) */}
              {suggestions.suggestions.length > 0 && (
                <div className="py-1">
                  {suggestions.suggestions.map((item, idx) => {
                    const globalIdx = suggestions.categories.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => navigateTo(item.href, item.text)}
                        className={cn(
                          "group flex min-h-[42px] w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm transition-colors sm:text-xs",
                          isSelected
                            ? "bg-rose-50 font-semibold text-[var(--accent)]"
                            : "hover:bg-rose-50/50 active:bg-rose-100/60"
                        )}
                      >
                        <Search className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-[var(--accent)] sm:h-3.5 sm:w-3.5" />
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
                <div className="bg-gradient-to-b from-gray-50/60 to-rose-50/20 p-3 sm:p-3.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-black tracking-widest text-neutral-500 uppercase">
                      Top Product Matches
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-500 shadow-2xs">
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
                      const hasDiscount =
                        Number(product.minMrp) > Number(product.minPrice);
                      const discountPercent = hasDiscount
                        ? Math.round(
                            ((Number(product.minMrp) -
                              Number(product.minPrice)) /
                              Number(product.minMrp)) *
                              100
                          )
                        : 0;

                      return (
                        <Link
                          key={product.id}
                          href={`/p/${product.slug}`}
                          onClick={() => {
                            saveRecent(product.name);
                            setIsOpen(false);
                            onSelect?.();
                          }}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl border border-gray-100/80 bg-white p-2 shadow-2xs transition-all hover:border-pink-200 hover:shadow-xs",
                            isSelected && "border-[var(--accent)] bg-rose-50/40"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {product.primaryImage?.url ? (
                              <Image
                                src={product.primaryImage.url}
                                alt={product.primaryImage.alt ?? product.name}
                                fill
                                sizes="40px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                              <p className="text-[9px] font-black tracking-wider text-neutral-400 uppercase">
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
                              {hasDiscount && (
                                <>
                                  <span className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(product.minMrp)}
                                  </span>
                                  <span className="text-[10px] font-black text-emerald-600">
                                    {discountPercent}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Bottom Footer: View all results */}
              <div className="bg-white p-2.5">
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-50/70 to-pink-50/70 py-2.5 text-xs font-bold text-[var(--accent)] transition-all hover:from-rose-100/80 hover:to-pink-100/80 active:scale-[0.99]"
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
                <div className="px-5 py-8 text-center sm:py-6">
                  <p className="text-sm font-semibold text-gray-700 sm:text-xs">
                    No instant suggestions for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-gray-400 sm:text-[11px]">
                    Press Enter to search the entire collection
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* STATE B: Empty query (Focused state — Recent, Trending & Categories) */
            <div className="p-4 sm:p-5">
              {/* Recent Searches (if available) */}
              {recentSearches.length > 0 && (
                <div className="mb-5 border-b border-gray-100 pb-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-neutral-500 uppercase">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 transition-colors hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          submitSearch(term);
                        }}
                        className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200/90 bg-white py-1 pr-2.5 pl-3.5 text-xs font-semibold text-neutral-800 shadow-2xs transition-colors hover:border-pink-300 hover:bg-pink-50/50 hover:text-[var(--accent)]"
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecent(term, e)}
                          className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                          aria-label={`Remove ${term} from recent searches`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="mb-5 sm:mb-4">
                <div className="mb-3 flex items-center gap-1.5 text-[11px] font-black tracking-widest text-[var(--accent)] uppercase">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        submitSearch(term);
                      }}
                      className="cursor-pointer rounded-full border border-gray-200/90 bg-gray-50/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-pink-300 hover:bg-pink-50 hover:text-[var(--accent)] active:scale-95"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="border-t border-gray-100 pt-4 sm:pt-3">
                <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-black tracking-widest text-neutral-400 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                  <span>Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => navigateTo(cat.href, cat.name)}
                      className="cursor-pointer rounded-full border border-pink-100 bg-pink-50/50 px-3.5 py-1.5 text-xs font-bold text-neutral-800 transition-colors hover:bg-[var(--accent)] hover:text-white active:scale-95"
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
                ? "font-extrabold text-[var(--accent)]"
                : "font-normal text-neutral-800"
            }
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}
