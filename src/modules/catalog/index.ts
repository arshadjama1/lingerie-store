import { z } from "zod";

import {
  getAvailableFilters,
  getCategoryBySlug,
  getFeaturedProducts,
  getProductBySlug,
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
const sortOptionSchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "popular",
]);

const listProductsSchema = z.object({
  categoryPath: z.string().optional(),
  brandSlug: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  sort: sortOptionSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  featuredOnly: z.boolean().optional(),
});

const searchProductsSchema = z.object({
  q: z.string().trim().min(1).max(200),
  categoryPath: z.string().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

// ── Public Module API ────────────────────────────────────────────────
export async function getCatalogCategories(): Promise<CategoryNode[]> {
  return listCategories();
}

export async function getCatalogCategoryBySlug(slug: string) {
  return getCategoryBySlug(slug);
}

export async function getCatalogProducts(
  params: unknown
): Promise<ListProductsResult> {
  const validated = listProductsSchema.parse(params || {});
  return listProducts(validated);
}

export async function getCatalogProduct(
  slug: string
): Promise<ProductDetail | null> {
  const validatedSlug = z.string().trim().min(1).parse(slug);
  return getProductBySlug(validatedSlug);
}

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

export async function getCatalogFilters(categoryPath?: string) {
  const validatedPath = z.string().optional().parse(categoryPath);
  return getAvailableFilters(validatedPath);
}

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
