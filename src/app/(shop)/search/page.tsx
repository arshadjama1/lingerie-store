import type { Metadata } from "next";
import { Suspense } from "react";

import { AlertCircle } from "lucide-react";

import { buildQueryString } from "@/lib/utils";

import {
  getCatalogCategories,
  getCatalogFilters,
  searchCatalog,
  searchSortOptionSchema,
} from "@/modules/catalog";

import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchFilterSidebar } from "@/components/search/SearchFilterSidebar";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
  }>;
}

const SEARCH_SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Customer Rating" },
];

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q?.trim()
      ? `Search results for "${q.trim()}" | Surekh`
      : "Search | Surekh",
    description: q?.trim()
      ? `Browse search results for "${q.trim()}" on Surekh.`
      : "Search our lingerie collection.",
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const {
    q,
    sort: rawSort,
    category,
    priceMin,
    priceMax,
    page: pageStr,
  } = await searchParams;

  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const min = priceMin ? Number(priceMin) : undefined;
  const max = priceMax ? Number(priceMax) : undefined;

  // Validate sort option
  const parsedSort = searchSortOptionSchema.safeParse(rawSort);
  const sort = parsedSort.success ? parsedSort.data : "relevance";

  // Parallel fetches
  const [results, filterData, categories] = await Promise.all([
    query
      ? searchCatalog({
          q: query,
          sort,
          categoryPath: category || undefined,
          priceMin: min,
          priceMax: max,
          page,
        }).catch(() => null)
      : null,
    getCatalogFilters().catch(() => ({
      sizes: [],
      colors: [],
      brands: [],
      priceRange: { min: 0, max: 10000 },
    })),
    getCatalogCategories().catch(() => []),
  ]);

  function buildPageUrl(p: number) {
    return (
      "/search" +
      buildQueryString({
        q: query || undefined,
        sort: sort !== "relevance" ? sort : undefined,
        category: category || undefined,
        priceMin,
        priceMax,
        page: p,
      })
    );
  }

  // ── Discovery state: no query ─────────────────────────────────────────
  if (!query) {
    return (
      <div className="bg-white pb-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Hero prompt */}
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-none bg-[var(--accent-subtle)] px-3 py-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase shadow-xs">
              SEARCH
            </span>
            <h1 className="font-serif text-3xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-4xl">
              What are you looking for?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              Search for bras, panties, nightwear, shapewear, and more.
            </p>
          </div>

          {/* Category quick links */}
          {categories.length > 0 && (
            <div className="mx-auto max-w-2xl">
              <p className="mb-4 text-center text-[10px] font-black tracking-widest text-gray-500 uppercase">
                Browse by Category
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {categories.slice(0, 8).map((cat) => (
                  <a
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="rounded-none border border-pink-200 bg-pink-50 px-4 py-2 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasResults = results && results.products.length > 0;

  return (
    <div className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <p className="mb-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
            Search Results
          </p>
          <h1 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
            &ldquo;{query}&rdquo;
          </h1>
          {results && (
            <p className="mt-1 text-xs text-gray-500">
              {results.total === 0
                ? "No products found"
                : `${results.total} ${results.total === 1 ? "product" : "products"} found`}
            </p>
          )}
        </div>

        {/* Fuzzy results banner */}
        {results?.isFuzzy && results.products.length > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            Showing approximate results for &ldquo;{query}&rdquo;. Try a shorter
            or different search term for exact matches.
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4">
          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-48 w-full animate-pulse rounded-none border border-gray-100 bg-[var(--surface)]" />
              }
            >
              <SearchFilterSidebar
                priceRange={filterData.priceRange}
                categories={categories}
              />
            </Suspense>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!hasResults ? (
              <EmptyState
                title={`No results for "${query}"`}
                description="Try searching with a shorter or different term, or browse our categories."
                action={{ label: "Browse all categories", href: "/" }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                    {results.total}{" "}
                    {results.total === 1 ? "Product" : "Products"} Found
                  </span>
                  <SortDropdown
                    options={SEARCH_SORT_OPTIONS}
                    defaultSort="relevance"
                  />
                </div>

                <Suspense
                  fallback={
                    <div className="h-96 w-full animate-pulse rounded-none bg-[var(--surface)]" />
                  }
                >
                  <ProductGrid products={results.products} priorityCount={4} />
                </Suspense>

                <Pagination
                  currentPage={page}
                  totalPages={results.totalPages}
                  buildUrl={buildPageUrl}
                  className="border-t border-gray-100 pt-8"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
