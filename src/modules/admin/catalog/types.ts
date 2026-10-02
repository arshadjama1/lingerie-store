import "server-only";

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  variantCount: number;
  totalStock: number;
  minPrice: string;
  maxPrice: string;
  primaryImageUrl: string | null;
  createdAt: Date;
};

export type AdminVariantInput = {
  id?: string; // present for updates
  sku: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: string; // decimal string
  mrp: string; // decimal string
  weightGrams: number | null;
  isActive: boolean;
  sortOrder: number;
  stock: number;
  lowStockAlert: number;
};

export type AdminProductImageInput = {
  id?: string;
  url: string;
  storagePath: string | null;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null; // null = product-level image
};

export type AdminProductInput = {
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  brandId: string | null;
  hsnCode: string | null;
  attributes: Record<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  variants: AdminVariantInput[];
  images: AdminProductImageInput[];
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  categoryPath: string;
  brandId: string | null;
  brandName: string | null;
  hsnCode: string | null;
  attributes: Record<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants: (AdminVariantInput & { id: string; inventoryId: string })[];
  images: (AdminProductImageInput & { id: string })[];
};

export type AdminCategoryOption = {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  slug: string;
};

export type AdminBrandOption = {
  id: string;
  name: string;
  slug: string;
};

export type ListAdminProductsParams = {
  search?: string;
  categoryId?: string;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type ListAdminProductsResult = {
  products: AdminProductListItem[];
  total: number;
  page: number;
  totalPages: number;
};
