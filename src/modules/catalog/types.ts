import type {
  brands,
  categories,
  inventory,
  productImages,
  productVariants,
  products,
} from "@/db";
import type { InferSelectModel } from "drizzle-orm";

// ── Raw DB row types (internal to queries.ts) ─────────────────────────
export type DbProduct = InferSelectModel<typeof products>;
export type DbProductVariant = InferSelectModel<typeof productVariants>;
export type DbProductImage = InferSelectModel<typeof productImages>;
export type DbCategory = InferSelectModel<typeof categories>;
export type DbBrand = InferSelectModel<typeof brands>;
export type DbInventory = InferSelectModel<typeof inventory>;

// ── Application-level types ───────────────────────────────────────────

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  primaryImage: { url: string; alt: string | null } | null;
  minPrice: string; // decimal as string — JS number can't represent arbitrary precision
  minMrp: string;
  isInStock: boolean;
  ratingAvg: string;
  ratingCount: number;
  soldCount: number;
};

export type VariantWithAvailability = Omit<DbProductVariant, "createdAt"> & {
  available: number; // quantity - reservedQuantity
  images: Pick<
    DbProductImage,
    "id" | "url" | "alt" | "isPrimary" | "sortOrder"
  >[];
};

export type ProductDetail = Omit<DbProduct, "updatedAt"> & {
  brand: Pick<DbBrand, "id" | "slug" | "name" | "logoUrl"> | null;
  category: Pick<DbCategory, "id" | "slug" | "name" | "path"> | null;
  variants: VariantWithAvailability[];
  images: Pick<
    DbProductImage,
    "id" | "url" | "alt" | "isPrimary" | "sortOrder" | "variantId"
  >[];
};

export type CategoryNode = DbCategory & {
  children?: CategoryNode[];
};

export type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

export type ListProductsParams = {
  categoryPath?: string;
  brandSlug?: string;
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
};

export type ListProductsResult = {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type SearchProductsParams = {
  q: string;
  categoryPath?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
};

export type SearchProductsResult = ListProductsResult & {
  isFuzzy: boolean;
};
