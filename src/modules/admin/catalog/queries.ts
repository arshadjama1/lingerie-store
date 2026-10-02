import { db } from "@/db";
import {
  brands,
  categories,
  inventory,
  productImages,
  productVariants,
  products,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import "server-only";

import type {
  AdminBrandOption,
  AdminCatalogStats,
  AdminCategoryOption,
  AdminProductDetail,
  AdminProductInput,
  ListAdminProductsParams,
  ListAdminProductsResult,
} from "./types";

export async function listAdminProducts(
  params: ListAdminProductsParams
): Promise<ListAdminProductsResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(products.name, `%${params.search}%`),
        ilike(products.slug, `%${params.search}%`)
      )
    );
  }

  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId));
  }

  if (params.isActive !== undefined) {
    conditions.push(eq(products.isActive, params.isActive));
  }

  if (params.stockStatus) {
    if (params.stockStatus === "in_stock") {
      conditions.push(
        sql`(SELECT COALESCE(SUM(i.quantity), 0) FROM product_variants pv LEFT JOIN inventory i ON i.variant_id = pv.id WHERE pv.product_id = ${products.id} AND pv.is_active = true) > 0`
      );
    } else if (params.stockStatus === "low_stock") {
      conditions.push(
        sql`(SELECT COALESCE(SUM(i.quantity), 0) FROM product_variants pv LEFT JOIN inventory i ON i.variant_id = pv.id WHERE pv.product_id = ${products.id} AND pv.is_active = true) > 0 AND (SELECT COALESCE(SUM(i.quantity), 0) FROM product_variants pv LEFT JOIN inventory i ON i.variant_id = pv.id WHERE pv.product_id = ${products.id} AND pv.is_active = true) <= 10`
      );
    } else if (params.stockStatus === "out_of_stock") {
      conditions.push(
        sql`(SELECT COALESCE(SUM(i.quantity), 0) FROM product_variants pv LEFT JOIN inventory i ON i.variant_id = pv.id WHERE pv.product_id = ${products.id} AND pv.is_active = true) = 0`
      );
    }
  }

  const baseQuery = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      categoryId: products.categoryId,
      categoryName: categories.name,
      brandId: products.brandId,
      brandName: brands.name,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      variantCount: sql<number>`(SELECT COUNT(*)::int FROM product_variants pv WHERE pv.product_id = ${products.id})`,
      totalStock: sql<number>`(SELECT COALESCE(SUM(i.quantity), 0)::int FROM product_variants pv LEFT JOIN inventory i ON i.variant_id = pv.id WHERE pv.product_id = ${products.id})`,
      minPrice: sql<string>`(SELECT COALESCE(MIN(pv.price), 0)::text FROM product_variants pv WHERE pv.product_id = ${products.id})`,
      maxPrice: sql<string>`(SELECT COALESCE(MAX(pv.price), 0)::text FROM product_variants pv WHERE pv.product_id = ${products.id})`,
      primaryImageUrl: sql<
        string | null
      >`(SELECT pi.url FROM product_images pi WHERE pi.product_id = ${products.id} AND pi.is_primary = true LIMIT 1)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions));

  const items = await baseQuery
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  const countQuery = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions));

  const total = countQuery[0]?.count ?? 0;

  return {
    products: items.map((p) => ({
      ...p,
      categoryName: p.categoryName || "Uncategorized",
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminProductById(
  id: string
): Promise<AdminProductDetail | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      brand: true,
      variants: {
        with: {
          inventory: true,
        },
      },
      images: true,
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "",
    categoryPath: product.categoryPath,
    brandId: product.brandId,
    brandName: product.brand?.name ?? null,
    hsnCode: product.hsnCode,
    attributes: product.attributes as Record<string, string>,
    tags: product.tags,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle,
    metaDesc: product.metaDesc,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      price: v.price,
      mrp: v.mrp,
      weightGrams: v.weightGrams,
      isActive: v.isActive,
      sortOrder: v.sortOrder,
      stock: v.inventory?.quantity ?? 0,
      lowStockAlert: v.inventory?.lowStockAlert ?? 5,
      inventoryId: v.inventory?.id ?? "",
    })),
    images: product.images.map((i) => ({
      id: i.id,
      url: i.url,
      storagePath: i.storagePath,
      alt: i.alt,
      isPrimary: i.isPrimary,
      sortOrder: i.sortOrder,
      variantId: i.variantId,
    })),
  };
}

export async function getAdminCategories(): Promise<AdminCategoryOption[]> {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      path: categories.path,
      parentId: categories.parentId,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(asc(categories.path));

  return result;
}

export async function getAdminBrands(): Promise<AdminBrandOption[]> {
  const result = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    })
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name));

  return result;
}

export async function getAdminCatalogStats(): Promise<AdminCatalogStats> {
  const [prodStats] = await db
    .select({
      totalProducts: sql<number>`count(distinct ${products.id})::int`,
      activeProducts: sql<number>`count(distinct case when ${products.isActive} = true then ${products.id} end)::int`,
    })
    .from(products);

  const [varStats] = await db
    .select({
      totalVariants: sql<number>`count(*)::int`,
    })
    .from(productVariants);

  const [invStats] = await db
    .select({
      lowStockCount: sql<number>`count(case when ${inventory.quantity} <= ${inventory.lowStockAlert} and ${inventory.quantity} > 0 then 1 end)::int`,
      outOfStockCount: sql<number>`count(case when ${inventory.quantity} = 0 then 1 end)::int`,
    })
    .from(inventory);

  const [catStats] = await db
    .select({
      categoryCount: sql<number>`count(*)::int`,
    })
    .from(categories);

  return {
    totalProducts: prodStats?.totalProducts ?? 0,
    activeProducts: prodStats?.activeProducts ?? 0,
    totalVariants: varStats?.totalVariants ?? 0,
    lowStockCount: invStats?.lowStockCount ?? 0,
    outOfStockCount: invStats?.outOfStockCount ?? 0,
    categoryCount: catStats?.categoryCount ?? 0,
  };
}

export async function createAdminProduct(
  input: AdminProductInput
): Promise<string> {
  return await db.transaction(async (tx) => {
    const category = await tx.query.categories.findFirst({
      where: eq(categories.id, input.categoryId),
    });
    if (!category) throw new Error("Category not found");

    const productId = createId();

    await tx.insert(products).values({
      id: productId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      categoryPath: category.path,
      brandId: input.brandId,
      hsnCode: input.hsnCode,
      attributes: input.attributes,
      tags: input.tags,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      metaTitle: input.metaTitle,
      metaDesc: input.metaDesc,
    });

    if (input.variants && input.variants.length > 0) {
      for (const v of input.variants) {
        const variantId = createId();
        await tx.insert(productVariants).values({
          id: variantId,
          productId,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          price: v.price,
          mrp: v.mrp,
          weightGrams: v.weightGrams,
          isActive: v.isActive,
          sortOrder: v.sortOrder,
        });

        await tx.insert(inventory).values({
          id: createId(),
          variantId,
          quantity: v.stock,
          reservedQuantity: 0,
          lowStockAlert: v.lowStockAlert,
        });
      }
    }

    if (input.images && input.images.length > 0) {
      for (const img of input.images) {
        await tx.insert(productImages).values({
          id: createId(),
          productId,
          url: img.url,
          storagePath: img.storagePath,
          alt: img.alt,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
          variantId: img.variantId,
        });
      }
    }

    return productId;
  });
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput
): Promise<void> {
  await db.transaction(async (tx) => {
    const category = await tx.query.categories.findFirst({
      where: eq(categories.id, input.categoryId),
    });
    if (!category) throw new Error("Category not found");

    await tx
      .update(products)
      .set({
        name: input.name,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId,
        categoryPath: category.path,
        brandId: input.brandId,
        hsnCode: input.hsnCode,
        attributes: input.attributes,
        tags: input.tags,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        metaTitle: input.metaTitle,
        metaDesc: input.metaDesc,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    if (input.variants) {
      for (const v of input.variants) {
        if (v.id) {
          await tx
            .update(productVariants)
            .set({
              sku: v.sku,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              price: v.price,
              mrp: v.mrp,
              weightGrams: v.weightGrams,
              isActive: v.isActive,
              sortOrder: v.sortOrder,
            })
            .where(eq(productVariants.id, v.id));

          await tx
            .update(inventory)
            .set({
              quantity: v.stock,
              lowStockAlert: v.lowStockAlert,
            })
            .where(eq(inventory.variantId, v.id));
        } else {
          const variantId = createId();
          await tx.insert(productVariants).values({
            id: variantId,
            productId: id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            price: v.price,
            mrp: v.mrp,
            weightGrams: v.weightGrams,
            isActive: v.isActive,
            sortOrder: v.sortOrder,
          });

          await tx.insert(inventory).values({
            id: createId(),
            variantId,
            quantity: v.stock,
            reservedQuantity: 0,
            lowStockAlert: v.lowStockAlert,
          });
        }
      }
    }

    if (input.images) {
      for (const img of input.images) {
        if (img.id) {
          await tx
            .update(productImages)
            .set({
              url: img.url,
              storagePath: img.storagePath,
              alt: img.alt,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
              variantId: img.variantId,
            })
            .where(eq(productImages.id, img.id));
        } else {
          await tx.insert(productImages).values({
            id: createId(),
            productId: id,
            url: img.url,
            storagePath: img.storagePath,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
            variantId: img.variantId,
          });
        }
      }
    }
  });
}

export async function toggleAdminProductStatus(
  id: string,
  field: "isActive" | "isFeatured",
  value: boolean
): Promise<void> {
  await db
    .update(products)
    .set({
      [field]: value,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
}
