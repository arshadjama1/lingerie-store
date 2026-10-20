import { cache } from "react";

import { z } from "zod";

import {
  getAvailableFilters,
  getCategoryBySlug,
  getFeaturedProducts,
  getProductBySlug,
  getProductIdByVariantId,
  getRelatedProducts,
  getSearchSuggestions,
  listCategories,
  listProducts,
  searchProducts,
} from "./queries";
import type {
  CategoryNode,
  ListProductsParams,
  ListProductsResult,
  ProductDetail,
  ProductListItem,
  SearchProductsParams,
  SearchProductsResult,
  SearchSuggestionCategory,
  SearchSuggestionKeyword,
  SearchSuggestionsResult,
  SortOption,
} from "./types";

// ── Zod validation schemas ──────────────────────────────────────────
export const VALID_SORT_OPTIONS = [
  "newest",
  "price_asc",
  "price_desc",
  "popular",
] as const;

export const sortOptionSchema = z
  .preprocess((val) => {
    if (!val) return "newest";
    const str = Array.isArray(val) ? String(val[0]) : String(val);
    const normalized = str.trim().toLowerCase().replace(/-/g, "_");
    if (
      normalized === "price_asc" ||
      normalized === "price_low_to_high" ||
      normalized === "price_low"
    ) {
      return "price_asc";
    }
    if (
      normalized === "price_desc" ||
      normalized === "price_high_to_low" ||
      normalized === "price_high"
    ) {
      return "price_desc";
    }
    if (
      normalized === "popular" ||
      normalized === "popularity" ||
      normalized === "rating" ||
      normalized === "bestseller"
    ) {
      return "popular";
    }
    if (
      normalized === "newest" ||
      normalized === "relevance" ||
      normalized === "created_at"
    ) {
      return "newest";
    }
    return (VALID_SORT_OPTIONS as readonly string[]).includes(normalized)
      ? (normalized as SortOption)
      : "newest";
  }, z.enum(VALID_SORT_OPTIONS))
  .default("newest");

const listProductsSchema = z.object({
  categoryPath: z.string().optional(),
  brandSlug: z.string().optional(),
  brandSlugs: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  sort: sortOptionSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  featuredOnly: z.boolean().optional(),
});

export const searchSortOptionSchema = z.enum([
  "relevance",
  "price_asc",
  "price_desc",
  "newest",
  "popular",
  "rating",
]);

const searchProductsSchema = z.object({
  q: z.string().trim().min(1).max(200),
  categoryPath: z.string().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  sort: searchSortOptionSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

// ── Public Module API ────────────────────────────────────────────────
// React.cache memoises each unique argument set for the lifetime of one
// server request. generateMetadata() and the page's default export both
// call these functions — with cache() the DB query runs only once.
export const getCatalogCategories = cache(async (): Promise<CategoryNode[]> => {
  return listCategories();
});

export const getCatalogCategoryBySlug = cache(async (slug: string) => {
  return getCategoryBySlug(slug);
});

export async function getCatalogProducts(
  params: unknown
): Promise<ListProductsResult> {
  const validated = listProductsSchema.parse(params || {});
  return listProducts(validated);
}

export const getCatalogProduct = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const validatedSlug = z.string().trim().min(1).parse(slug);
    return getProductBySlug(validatedSlug);
  }
);

export async function getCatalogFeatured(
  limit?: number
): Promise<ProductListItem[]> {
  const validatedLimit = z.number().int().positive().optional().parse(limit);
  return getFeaturedProducts(validatedLimit);
}

export async function getCatalogRelated(
  id: string,
  path: string,
  limit?: number
): Promise<ProductListItem[]> {
  const validatedId = z.string().min(1).parse(id);
  const validatedPath = z.string().min(1).parse(path);
  const validatedLimit = z.number().int().positive().optional().parse(limit);
  return getRelatedProducts(validatedId, validatedPath, validatedLimit);
}

export const getCatalogFilters = cache(async (categoryPath?: string) => {
  const validatedPath = z.string().optional().parse(categoryPath);
  return getAvailableFilters(validatedPath);
});

export async function searchCatalog(
  params: unknown
): Promise<SearchProductsResult> {
  const validated = searchProductsSchema.parse(params);
  return searchProducts(validated);
}

export async function getCatalogSearchSuggestions(
  query: string
): Promise<SearchSuggestionsResult> {
  const validated = z.string().trim().max(200).parse(query);
  return getSearchSuggestions(validated);
}

export { getProductIdByVariantId };
export {
  BRA_SIZE_CHART_URL,
  UNDIES_SIZE_CHART_URL,
  getProductSizeChart,
  SIZE_ORDER,
  sortSizesNaturally,
  type ProductSizeChart,
} from "./constants";

// ── Re-exports all types so consumers only need one import ───────────
export type {
  CategoryNode,
  ProductDetail,
  ProductListItem,
  ListProductsParams,
  ListProductsResult,
  SearchProductsParams,
  SearchProductsResult,
  SearchSuggestionCategory,
  SearchSuggestionKeyword,
  SearchSuggestionsResult,
  SortOption,
};
