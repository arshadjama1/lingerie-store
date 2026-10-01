// ── Admin Inventory Module — Types ────────────────────────────────────

export type InventorySortOption =
  | "name_asc"
  | "name_desc"
  | "qty_asc"
  | "qty_desc"
  | "sku";

export interface ListInventoryParams {
  search?: string;
  lowStockOnly?: boolean;
  categoryId?: string;
  sort?: InventorySortOption;
  page?: number;
  limit?: number;
}

export interface InventoryListItem {
  // inventory
  inventoryId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockAlert: number;
  available: number; // computed: quantity - reservedQuantity
  isLowStock: boolean; // computed: quantity <= lowStockAlert

  // variant
  variantId: string;
  sku: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: string;
  mrp: string;
  variantIsActive: boolean;

  // product
  productId: string;
  productName: string;
  productSlug: string;

  // relations
  categoryName: string | null;
  brandName: string | null;
}

export interface ListInventoryResult {
  items: InventoryListItem[];
  total: number;
  page: number;
  totalPages: number;
  lowStockCount: number;
}

export interface UpdateStockPayload {
  variantId: string;
  quantity: number;
  lowStockAlert: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}
