import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  AlertCircle,
  ChevronRight,
  Flame,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";

import { buildQueryString } from "@/lib/utils";

import {
  getCatalogCategories,
  getCatalogFeatured,
  searchCatalog,
  searchSortOptionSchema,
} from "@/modules/catalog";

import { Pagination } from "@/components/common/pagination";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

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

const DISCOVERY_TRENDING_TERMS = [
  "Bamboo Fabric Bra",
  "Seamless Undies",
  "Padded Lycra Bra",
  "Overlap Bralette",
  "Lingerie Set",
  "Camisole",
  "Boyleg Undies",
];

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q?.trim()
      ? `Search results for "${q.trim()}" | Surekh`
      : "Search Catalog | Surekh",
    description: q?.trim()
      ? `Explore lingerie and innerwear search results for "${q.trim()}" on Surekh.`
      : "Search luxury bras, panties, loungewear, and lingerie sets.",
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
  const [results, categories, featuredProducts] = await Promise.all([
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
    getCatalogCategories().catch(() => []),
    getCatalogFeatured(4).catch(() => []),
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

  // ── Discovery State: User navigated to /search without a query ───────
  if (!query) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-rose-50/40 via-white to-white pb-20">
        <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          {/* Hero prompt */}
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded-full bg-rose-100/80 px-3.5 py-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase shadow-2xs">
              EXPLORE OUR COLLECTION
            </span>
            <h1 className="font-serif text-3xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-5xl">
              What are you looking for?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
              Discover everyday comfort and luxury across bras, panties, sets,
              and loungewear.
            </p>
          </div>

          {/* Large On-Page Search Input */}
          <div className="mx-auto mb-10 max-w-2xl">
            <SearchAutocomplete
              autoFocus
              placeholder="Search by product, color, or style (e.g. bamboo bra, olive set)..."
              inputClassName="h-13 text-sm pr-12 pl-12 shadow-sm border-rose-200/80 focus:border-[var(--accent)] bg-white"
            />
          </div>

          {/* Trending Searches */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-[var(--accent)] uppercase">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {DISCOVERY_TRENDING_TERMS.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-2xs transition-all hover:border-pink-300 hover:bg-rose-50 hover:text-[var(--accent)] hover:shadow-xs active:scale-95"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* Browse by Category */}
          {categories.length > 0 && (
            <div className="mx-auto mb-16 max-w-3xl">
              <p className="mb-4 text-center text-xs font-black tracking-widest text-neutral-400 uppercase">
                Browse by Category
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-2xs transition-all hover:border-[var(--accent)] hover:shadow-md active:scale-98"
                  >
                    <span className="font-serif text-base font-bold text-neutral-800 transition-colors group-hover:text-[var(--accent)]">
                      {cat.name}
                    </span>
                    <span className="mt-1 text-[11px] font-semibold text-neutral-400 group-hover:text-[var(--accent)]">
                      Explore Collection →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured / Best Sellers Preview */}
          {featuredProducts.length > 0 && (
            <div className="border-t border-rose-100/70 pt-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                    CURATED ESSENTIALS
                  </span>
                  <h2 className="font-serif text-xl font-black text-[var(--accent-plum)] uppercase sm:text-2xl">
                    Popular Right Now
                  </h2>
                </div>
                <Link
                  href="/sale"
                  className="text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  View All →
                </Link>
              </div>

              <ProductGrid
                products={featuredProducts}
                className="grid-cols-2 sm:grid-cols-4"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasResults = results && results.products.length > 0;
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-neutral-700">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/search"
            className="transition-colors hover:text-neutral-700"
          >
            Search
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-xs truncate font-semibold text-neutral-800">
            &ldquo;{query}&rdquo;
          </span>
          {activeCategory && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="font-bold text-[var(--accent)]">
                {activeCategory.name}
              </span>
            </>
          )}
        </nav>

        {/* Page Title & Search Stats */}
        <div className="mb-6">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
              &ldquo;{query}&rdquo;
            </h1>
            {results && (
              <span className="text-xs font-semibold text-neutral-500">
                — {results.total} {results.total === 1 ? "result" : "results"}{" "}
                found
              </span>
            )}
          </div>
        </div>

        {/* Approximate / Fuzzy Notice Banner */}
        {results?.isFuzzy && results.products.length > 0 && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/70 px-4 py-3 text-xs font-medium text-amber-900 shadow-2xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              Showing approximate results for &ldquo;{query}&rdquo;. For exact
              matches, try a shorter keyword or check your spelling.
            </span>
          </div>
        )}

        {/* Main Full-Width Results Container */}
        <div>
          {!hasResults ? (
            /* High-Value Empty State with recovery suggestions & best sellers */
            <div className="space-y-12">
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/30 via-white to-white p-8 text-center sm:p-12">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100/70 text-[var(--accent)]">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-xl font-black text-[var(--accent-plum)] uppercase sm:text-2xl">
                  No exact matches found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-xs text-neutral-500 sm:text-sm">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                  Check for typos, try broader terms, or browse popular searches
                  below.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {DISCOVERY_TRENDING_TERMS.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-pink-300 hover:bg-rose-50 hover:text-[var(--accent)]"
                    >
                      {term}
                    </Link>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[var(--accent-dark)]"
                  >
                    Browse All Categories
                  </Link>
                </div>
              </div>

              {/* Popular recommendations on zero-results to prevent bounce */}
              {featuredProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <h3 className="font-serif text-lg font-black text-[var(--accent-plum)] uppercase">
                      Recommended For You
                    </h3>
                  </div>
                  <ProductGrid
                    products={featuredProducts}
                    className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Results List */
            <div className="space-y-6">
              {/* Header bar above grid: Count & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
                <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                  {results.total} {results.total === 1 ? "Product" : "Products"}{" "}
                  Found
                </span>
                <SortDropdown
                  options={SEARCH_SORT_OPTIONS}
                  defaultSort="relevance"
                />
              </div>

              {/* Product Grid (Full-width 4-column) */}
              <Suspense
                fallback={
                  <div className="h-96 w-full animate-pulse rounded-2xl bg-[var(--surface)]" />
                }
              >
                <ProductGrid
                  products={results.products}
                  className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  priorityCount={4}
                />
              </Suspense>

              {/* Pagination */}
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
  );
}
