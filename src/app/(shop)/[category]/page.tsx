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
import { FilterSidebar } from "@/components/filters/filter-sidebar";
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
    title: `${category.name} | LINGE Storefront`,
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

  // Normalize search params to arrays for multi-selects
  const sizes = resolvedSearchParams.size
    ? Array.isArray(resolvedSearchParams.size)
      ? resolvedSearchParams.size
      : [resolvedSearchParams.size]
    : undefined;

  const colors = resolvedSearchParams.color
    ? Array.isArray(resolvedSearchParams.color)
      ? resolvedSearchParams.color
      : [resolvedSearchParams.color]
    : undefined;

  const brands = resolvedSearchParams.brand
    ? Array.isArray(resolvedSearchParams.brand)
      ? resolvedSearchParams.brand
      : [resolvedSearchParams.brand]
    : undefined;

  const brandSlug = brands && brands.length > 0 ? brands[0] : undefined;

  const priceMin = resolvedSearchParams.priceMin
    ? Number(resolvedSearchParams.priceMin)
    : undefined;
  const priceMax = resolvedSearchParams.priceMax
    ? Number(resolvedSearchParams.priceMax)
    : undefined;
  const sort = (resolvedSearchParams.sort || "newest") as SortOption;
  const page = resolvedSearchParams.page
    ? Number(resolvedSearchParams.page)
    : 1;

  // Fetch product listings & filters in parallel with graceful catch blocks
  const [productData, filterData] = await Promise.all([
    getCatalogProducts({
      categoryPath: category.path,
      sizes,
      colors,
      brandSlug,
      priceMin,
      priceMax,
      sort,
      page,
      limit: 12,
    }).catch(() => ({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    })),
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
    if (resolvedSearchParams.priceMin)
      q.priceMin = resolvedSearchParams.priceMin;
    if (resolvedSearchParams.priceMax)
      q.priceMax = resolvedSearchParams.priceMax;
    if (resolvedSearchParams.size) q.size = resolvedSearchParams.size;
    if (resolvedSearchParams.color) q.color = resolvedSearchParams.color;
    if (resolvedSearchParams.brand) q.brand = resolvedSearchParams.brand;
    q.page = targetPage;
    return `/${slug}${buildQueryString(q)}`;
  };

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: category.name }];

  return (
    <main className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} className="mb-4" />

        {/* Category Hero Banner */}
        <div className="mb-8 rounded-none bg-gradient-to-r from-[#3d0a20] via-[#5c1032] to-[#7b1842] p-8 text-white shadow-md sm:p-10">
          <span className="mb-2 inline-block rounded-none bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-xs">
            COLLECTION SHOWCASE
          </span>
          <h1 className="font-serif text-3xl font-black tracking-tight text-white uppercase sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed font-light text-pink-100 sm:text-sm">
            Explore our curated selection of {category.name.toLowerCase()}.
            Meticulously tailored for shape, silhouette, skin-soft comfort, and
            signature confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-96 w-full animate-pulse rounded-none border border-gray-100 bg-[var(--surface)]" />
              }
            >
              <FilterSidebar
                sizes={filterData.sizes}
                colors={filterData.colors}
                brands={filterData.brands}
                priceRange={filterData.priceRange}
              />
            </Suspense>
          </div>

          {/* Catalog List Display */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                {productData.total}{" "}
                {productData.total === 1 ? "Product" : "Products"} Available
              </span>
            </div>

            {productData.products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try clearing some filters or searching for something else."
                action={{ label: "Clear all filters", href: `/${slug}` }}
              />
            ) : (
              <div className="space-y-10">
                <Suspense
                  fallback={
                    <div className="h-96 w-full animate-pulse rounded-none bg-[var(--surface)]" />
                  }
                >
                  <ProductGrid
                    products={productData.products}
                    priorityCount={4}
                  />
                </Suspense>

                <Pagination
                  currentPage={page}
                  totalPages={productData.totalPages}
                  buildUrl={buildPageUrl}
                  className="border-t border-gray-100 pt-8"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
