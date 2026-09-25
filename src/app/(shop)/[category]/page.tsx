import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { buildQueryString } from "@/lib/utils";

import {
  type SortOption,
  getCatalogCategories,
  getCatalogCategoryBySlug,
  getCatalogFilters,
  getCatalogProducts,
} from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { ActiveFiltersBar } from "@/components/filters/active-filters-bar";
import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { MobileFilterDrawer } from "@/components/filters/mobile-filter-drawer";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { ProductGrid } from "@/components/product/product-grid";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    size?: string | string[];
    color?: string | string[];
    brand?: string | string[];
    priceMin?: string;
    priceMax?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getCatalogCategories().catch(() => []);

  const paths: Array<{ category: string }> = [];
  function collectSlugs(nodes: typeof categories) {
    for (const node of nodes) {
      paths.push({ category: node.slug });
      if (node.children && node.children.length > 0) {
        collectSlugs(node.children);
      }
    }
  }
  collectSlugs(categories);
  return paths;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCatalogCategoryBySlug(slug).catch(() => null);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} | Surekh Storefront`,
    description: `Browse our elegant selection of ${category.name.toLowerCase()}. Handcrafted with signature support, luxury fabrics, and precision fit.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: slug } = await params;

  const category = await getCatalogCategoryBySlug(slug).catch(() => null);

  if (!category) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;

  // Helper to robustly parse single, array, or comma-separated query params
  const parseArrayParam = (val?: string | string[]): string[] | undefined => {
    if (!val) return undefined;
    const items = Array.isArray(val) ? val : [val];
    const flat = items
      .flatMap((item) => item.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
    return flat.length > 0 ? Array.from(new Set(flat)) : undefined;
  };

  const sizes = parseArrayParam(resolvedSearchParams.size);
  const colors = parseArrayParam(resolvedSearchParams.color);

  const priceMin =
    resolvedSearchParams.priceMin !== undefined &&
    resolvedSearchParams.priceMin !== "" &&
    !isNaN(Number(resolvedSearchParams.priceMin))
      ? Math.max(0, Number(resolvedSearchParams.priceMin))
      : undefined;

  const priceMax =
    resolvedSearchParams.priceMax !== undefined &&
    resolvedSearchParams.priceMax !== "" &&
    !isNaN(Number(resolvedSearchParams.priceMax))
      ? Math.max(0, Number(resolvedSearchParams.priceMax))
      : undefined;

  const sort = (resolvedSearchParams.sort || "newest") as SortOption;
  const page =
    resolvedSearchParams.page && !isNaN(Number(resolvedSearchParams.page))
      ? Math.max(1, Number(resolvedSearchParams.page))
      : 1;

  // Fetch product listings & filters in parallel with graceful catch blocks
  const [productData, filterData] = await Promise.all([
    getCatalogProducts({
      categoryPath: category.path,
      sizes,
      colors,
      priceMin,
      priceMax,
      sort,
      page,
      limit: 12,
    }).catch((err) => {
      console.error("[CategoryPage] getCatalogProducts failed:", err);
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }),
    getCatalogFilters(category.path).catch(() => ({
      sizes: [],
      colors: [],
      brands: [],
      priceRange: { min: 0, max: 5000 },
    })),
  ]);

  // Dynamic URL builder for pagination preserving filters
  const buildPageUrl = (targetPage: number) => {
    const q: Record<string, string | string[] | number | undefined> = {};
    if (resolvedSearchParams.sort) q.sort = resolvedSearchParams.sort;
    if (resolvedSearchParams.priceMin !== undefined)
      q.priceMin = resolvedSearchParams.priceMin;
    if (resolvedSearchParams.priceMax !== undefined)
      q.priceMax = resolvedSearchParams.priceMax;
    if (sizes && sizes.length > 0) q.size = sizes;
    if (colors && colors.length > 0) q.color = colors;
    q.page = targetPage;
    return `/${slug}${buildQueryString(q)}`;
  };

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: category.name }];

  return (
    <main className="min-h-screen bg-[#faf8f7]/50 pb-20">
      {/* Category Editorial Header */}
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-6 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbs} className="mb-3" />

          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-stone-500 sm:text-sm">
              Explore our curated selection of {category.name.toLowerCase()}.
              Meticulously tailored for silhouette, breathable all-day comfort,
              and signature confidence.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4">
          {/* Desktop Filter Sidebar (Sticky, Hidden on mobile) */}
          <div className="hidden lg:col-span-1 lg:block">
            <Suspense
              fallback={
                <div className="h-96 w-full animate-pulse rounded-none border border-stone-200 bg-white" />
              }
            >
              <FilterSidebar
                sizes={filterData.sizes}
                colors={filterData.colors}
                priceRange={filterData.priceRange}
              />
            </Suspense>
          </div>

          {/* Catalog Products Area */}
          <div className="lg:col-span-3">
            {/* Top Controls Bar */}
            <div className="mb-4 flex flex-col gap-3 rounded-none border-b border-stone-200/80 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              {/* Product Count & Title */}
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <span className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                  {productData.total}{" "}
                  {productData.total === 1 ? "Product" : "Products"}
                </span>

                {/* Mobile Filter Drawer Trigger */}
                <MobileFilterDrawer
                  sizes={filterData.sizes}
                  colors={filterData.colors}
                  priceRange={filterData.priceRange}
                  totalProducts={productData.total}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center justify-end">
                <SortDropdown />
              </div>
            </div>

            {/* Active Filters Pills Bar */}
            <ActiveFiltersBar className="mb-4" />

            {/* Products Grid or Empty State */}
            {productData.products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try clearing some filters or selecting a different category."
                action={{ label: "Clear all filters", href: `/${slug}` }}
              />
            ) : (
              <div className="space-y-10">
                <Suspense
                  fallback={
                    <div className="h-96 w-full animate-pulse rounded-none bg-stone-100" />
                  }
                >
                  <ProductGrid
                    products={productData.products}
                    priorityCount={4}
                    className="grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3"
                  />
                </Suspense>

                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={productData.totalPages}
                  buildUrl={buildPageUrl}
                  className="border-t border-stone-200/80 pt-8"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
