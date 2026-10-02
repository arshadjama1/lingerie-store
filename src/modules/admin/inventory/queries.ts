import { db } from "@/db";
import {
  brands,
  categories,
  inventory,
  productVariants,
  products,
} from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import "server-only";

import type {
  InventoryListItem,
  InventorySortOption,
  ListInventoryParams,
  ListInventoryResult,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// listInventory
// ─────────────────────────────────────────────────────────────────────

export async function listInventory(
  params: ListInventoryParams = {}
): Promise<ListInventoryResult> {
  const {
    search,
    lowStockOnly = false,
    categoryId,
    sort = "name_asc",
    page = 1,
    limit = 50,
  } = params;

  const offset = (Math.max(1, page) - 1) * limit;

  // ── Build WHERE conditions ────────────────────────────────────────
  const conditions = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(productVariants.sku, term),
        ilike(productVariants.color, term)
      )
    );
  }

  if (lowStockOnly) {
    conditions.push(sql`${inventory.quantity} <= ${inventory.lowStockAlert}`);
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // ── ORDER BY ─────────────────────────────────────────────────────
  const orderByMap: Record<InventorySortOption, ReturnType<typeof asc>[]> = {
    name_asc: [asc(products.name), asc(productVariants.sku)],
    name_desc: [desc(products.name), asc(productVariants.sku)],
    qty_asc: [asc(inventory.quantity), asc(products.name)],
    qty_desc: [desc(inventory.quantity), asc(products.name)],
    sku: [asc(productVariants.sku)],
  };

  const orderBy = orderByMap[sort] ?? orderByMap.name_asc;

  // ── Fetch rows + count in parallel ───────────────────────────────
  const [rows, countResult, lowStockCountResult] = await Promise.all([
    db
      .select({
        inventoryId: inventory.id,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lowStockAlert: inventory.lowStockAlert,

        variantId: productVariants.id,
        sku: productVariants.sku,
        size: productVariants.size,
        color: productVariants.color,
        colorHex: productVariants.colorHex,
        price: productVariants.price,
        mrp: productVariants.mrp,
        variantIsActive: productVariants.isActive,

        productId: products.id,
        productName: products.name,
        productSlug: products.slug,

        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(inventory)
      .innerJoin(productVariants, eq(productVariants.id, inventory.variantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(inventory)
      .innerJoin(productVariants, eq(productVariants.id, inventory.variantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(whereClause),

    // Global low-stock count (not filtered) — for the page header badge
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.lowStockAlert}`),
  ]);

  const total = countResult[0]?.count ?? 0;

  const items: InventoryListItem[] = rows.map((r) => ({
    inventoryId: r.inventoryId,
    quantity: r.quantity,
    reservedQuantity: r.reservedQuantity,
    lowStockAlert: r.lowStockAlert,
    available: Math.max(0, r.quantity - r.reservedQuantity),
    isLowStock: r.quantity <= r.lowStockAlert,

    variantId: r.variantId,
    sku: r.sku,
    size: r.size ?? null,
    color: r.color ?? null,
    colorHex: r.colorHex ?? null,
    price: r.price,
    mrp: r.mrp,
    variantIsActive: r.variantIsActive,

    productId: r.productId,
    productName: r.productName,
    productSlug: r.productSlug,

    categoryName: r.categoryName ?? null,
    brandName: r.brandName ?? null,
  }));

  return {
    items,
    total,
    page: Math.max(1, page),
    totalPages: Math.max(1, Math.ceil(total / limit)),
    lowStockCount: lowStockCountResult[0]?.count ?? 0,
  };
}
