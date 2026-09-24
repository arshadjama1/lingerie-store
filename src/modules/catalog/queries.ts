/**
 * src/modules/catalog/queries.ts
 *
 * All database queries for the catalog domain. This file is NOT part of
 * the public module API — consumers import from index.ts, which validates
 * inputs and calls these functions. That boundary means:
 *   - Validation logic doesn't leak into query functions
 *   - Query functions can be tested with raw args, no Zod overhead
 *   - The public API can change shape without touching query SQL
 *
 * Query strategy per function:
 *   listCategories   → relational API (simple tree, no aggregation)
 *   listProducts     → query builder (aggregation: minPrice, isInStock)
 *   getProductBySlug → relational API (nested objects, no aggregation)
 *   searchProducts   → raw sql() (tsvector @@ operator not in Drizzle builder)
 */
import { db } from "@/db";
import {
  brands,
  categories,
  inventory,
  productImages,
  productVariants,
  products,
} from "@/db/schema";
import { and, asc, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";

import type {
  CategoryNode,
  DbCategory,
  ListProductsParams,
  ListProductsResult,
  ProductDetail,
  ProductListItem,
  SearchProductsParams,
  SearchProductsResult,
  SearchSuggestionsResult,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// listCategories
// ─────────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<CategoryNode[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return buildCategoryTree(rows, null);
}

function buildCategoryTree(
  rows: DbCategory[],
  parentId: string | null
): CategoryNode[] {
  return rows
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      ...c,
      children: buildCategoryTree(rows, c.id),
    }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<DbCategory | undefined> {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);

  return rows[0];
}

// ─────────────────────────────────────────────────────────────────────
// listProducts
// ─────────────────────────────────────────────────────────────────────

export async function listProducts(
  params: ListProductsParams
): Promise<ListProductsResult> {
  const {
    categoryPath,
    brandSlug,
    sizes,
    colors,
    priceMin,
    priceMax,
    sort = "newest",
    page = 1,
    limit = 24,
    featuredOnly = false,
  } = params;

  const offset = (page - 1) * limit;

  const conditions = [
    eq(products.isActive, true),
    sql`EXISTS (
      SELECT 1 FROM ${productVariants} pv
      WHERE pv.product_id = ${products.id}
        AND pv.is_active  = true
    )`,
  ];

  if (categoryPath) {
    conditions.push(sql`${products.categoryPath} LIKE ${categoryPath + "%"}`);
  }

  if (featuredOnly) {
    conditions.push(eq(products.isFeatured, true));
  }

  if (brandSlug) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${brands} b
        WHERE b.id   = ${products.brandId}
          AND b.slug = ${brandSlug}
          AND b.is_active = true
      )`
    );
  }

  if (sizes && sizes.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id}
          AND pv.is_active  = true
          AND pv.size       = ANY(${sizes})
      )`
    );
  }

  if (colors && colors.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id}
          AND pv.is_active  = true
          AND pv.color      = ANY(${colors})
      )`
    );
  }

  if (priceMin !== undefined) {
    conditions.push(
      sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id}
          AND pv.is_active  = true
      ) >= ${priceMin}`
    );
  }

  if (priceMax !== undefined) {
    conditions.push(
      sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id}
          AND pv.is_active  = true
      ) <= ${priceMax}`
    );
  }

  const whereClause = and(...conditions);

  const orderBy = {
    newest: [desc(products.createdAt)],
    price_asc: [
      asc(sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id} AND pv.is_active = true
      )`),
    ],
    price_desc: [
      desc(sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products.id} AND pv.is_active = true
      )`),
    ],
    popular: [desc(products.soldCount), desc(products.ratingCount)],
  }[sort];

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        isFeatured: products.isFeatured,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        soldCount: products.soldCount,
        brandName: brands.name,
        primaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order
          LIMIT  1
        )`,
        primaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order
          LIMIT  1
        )`,
        secondaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order
          LIMIT  1
        )`,
        secondaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order
          LIMIT  1
        )`,
        colors: sql<
          Array<{ color: string; hex: string | null; imageUrl?: string | null }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'color', c.color,
                'hex', c.color_hex,
                'imageUrl', c.image_url
              )
            ),
            '[]'::json
          )
          FROM (
            SELECT DISTINCT ON (pv.color) 
              pv.color, 
              pv.color_hex,
              (
                SELECT pi.url 
                FROM ${productImages} pi 
                WHERE pi.variant_id = pv.id 
                ORDER BY pi.sort_order 
                LIMIT 1
              ) as image_url
            FROM ${productVariants} pv
            WHERE pv.product_id = ${products.id}
              AND pv.is_active = true
            ORDER BY pv.color
          ) c
        )`,
        variants: sql<
          Array<{
            id: string;
            size: string;
            color: string;
            price: string;
            isAvailable: boolean;
          }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'size', pv.size,
                'color', pv.color,
                'price', pv.price::text,
                'isAvailable', (inv.quantity - inv.reserved_quantity) > 0
              )
              ORDER BY pv.sort_order ASC, pv.size ASC
            ),
            '[]'::json
          )
          FROM ${productVariants} pv
          JOIN ${inventory} inv ON inv.variant_id = pv.id
          WHERE pv.product_id = ${products.id}
            AND pv.is_active = true
        )`,
        minPrice: sql<string>`(
          SELECT MIN(pv.price)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id}
            AND  pv.is_active  = true
        )`,
        minMrp: sql<string>`(
          SELECT MIN(pv.mrp)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id}
            AND  pv.is_active  = true
        )`,
        isInStock: sql<boolean>`EXISTS (
          SELECT 1 FROM ${productVariants} pv
          JOIN   ${inventory} inv ON inv.variant_id = pv.id
          WHERE  pv.product_id = ${products.id}
            AND  pv.is_active  = true
            AND  (inv.quantity - inv.reserved_quantity) > 0
        )`,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;
  const productListItems: ProductListItem[] = rows.map(toProductListItem);

  return {
    products: productListItems,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────
// getProductBySlug
// ─────────────────────────────────────────────────────────────────────

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      brand: {
        columns: { id: true, slug: true, name: true, logoUrl: true },
      },
      category: {
        columns: { id: true, slug: true, name: true, path: true },
      },
      images: {
        where: isNull(productImages.variantId),
        orderBy: [asc(productImages.sortOrder)],
        columns: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true,
          sortOrder: true,
          variantId: true,
        },
      },
      variants: {
        where: eq(productVariants.isActive, true),
        orderBy: [asc(productVariants.sortOrder), asc(productVariants.size)],
        with: {
          inventory: true,
          images: {
            orderBy: [asc(productImages.sortOrder)],
            columns: {
              id: true,
              url: true,
              alt: true,
              isPrimary: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  const variants = row.variants.map(
    ({ inventory: inv, ...variant }: (typeof row.variants)[number]) => ({
      ...variant,
      available: Math.max(
        0,
        (inv?.quantity ?? 0) - (inv?.reservedQuantity ?? 0)
      ),
    })
  );

  const { updatedAt: _updatedAt, ...productFields } = row;

  return {
    ...productFields,
    variants,
  };
}

// ─────────────────────────────────────────────────────────────────────
// searchProducts
// ─────────────────────────────────────────────────────────────────────

export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResult> {
  const { q, categoryPath, priceMin, priceMax, page = 1, limit = 24 } = params;
  const offset = (page - 1) * limit;

  const baseConditions = [
    eq(products.isActive, true),
    sql`EXISTS (
      SELECT 1 FROM ${productVariants} pv
      JOIN   ${inventory} inv ON inv.variant_id = pv.id
      WHERE  pv.product_id = ${products.id}
        AND  pv.is_active  = true
        AND  (inv.quantity - inv.reserved_quantity) > 0
    )`,
  ];

  if (categoryPath) {
    baseConditions.push(
      sql`${products.categoryPath} LIKE ${categoryPath + "%"}`
    );
  }
  if (priceMin !== undefined) {
    baseConditions.push(
      sql`(SELECT MIN(pv.price) FROM ${productVariants} pv
          WHERE pv.product_id = ${products.id} AND pv.is_active = true
         ) >= ${priceMin}`
    );
  }
  if (priceMax !== undefined) {
    baseConditions.push(
      sql`(SELECT MIN(pv.price) FROM ${productVariants} pv
          WHERE pv.product_id = ${products.id} AND pv.is_active = true
         ) <= ${priceMax}`
    );
  }

  // ── Phase 1: FTS ──────────────────────────────────────────────────
  const ftsConditions = [
    ...baseConditions,
    sql`${products}.search_vector @@ plainto_tsquery('english', ${q})`,
  ];

  const [ftsRows, ftsCount] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        isFeatured: products.isFeatured,
        brandName: brands.name,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        soldCount: products.soldCount,
        primaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        primaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        secondaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        secondaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        colors: sql<
          Array<{ color: string; hex: string | null; imageUrl?: string | null }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'color', c.color,
                'hex', c.color_hex,
                'imageUrl', c.image_url
              )
            ),
            '[]'::json
          )
          FROM (
            SELECT DISTINCT ON (pv.color) 
              pv.color, 
              pv.color_hex,
              (
                SELECT pi.url 
                FROM ${productImages} pi 
                WHERE pi.variant_id = pv.id 
                ORDER BY pi.sort_order 
                LIMIT 1
              ) as image_url
            FROM ${productVariants} pv
            WHERE pv.product_id = ${products.id}
              AND pv.is_active = true
            ORDER BY pv.color
          ) c
        )`,
        variants: sql<
          Array<{
            id: string;
            size: string;
            color: string;
            price: string;
            isAvailable: boolean;
          }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'size', pv.size,
                'color', pv.color,
                'price', pv.price::text,
                'isAvailable', (inv.quantity - inv.reserved_quantity) > 0
              )
              ORDER BY pv.sort_order ASC, pv.size ASC
            ),
            '[]'::json
          )
          FROM ${productVariants} pv
          JOIN ${inventory} inv ON inv.variant_id = pv.id
          WHERE pv.product_id = ${products.id}
            AND pv.is_active = true
        )`,
        minPrice: sql<string>`(
          SELECT MIN(pv.price)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id} AND pv.is_active = true
        )`,
        minMrp: sql<string>`(
          SELECT MIN(pv.mrp)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id} AND pv.is_active = true
        )`,
        isInStock: sql<boolean>`true`,
        rank: sql<number>`ts_rank(
          ${products}.search_vector,
          plainto_tsquery('english', ${q})
        )`,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...ftsConditions))
      .orderBy(
        desc(
          sql`ts_rank(${products}.search_vector, plainto_tsquery('english', ${q}))`
        ),
        desc(products.soldCount)
      )
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(and(...ftsConditions)),
  ]);

  if (ftsRows.length > 0) {
    const total = ftsCount[0]?.count ?? 0;
    return {
      products: ftsRows.map(toProductListItem),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      isFuzzy: false,
    };
  }

  // ── Phase 2: trigram fallback ─────────────────────────────────────
  const SIMILARITY_THRESHOLD = 0.15;

  const fuzzyConditions = [
    ...baseConditions,
    gt(sql<number>`similarity(${products.name}, ${q})`, SIMILARITY_THRESHOLD),
  ];

  const [fuzzyRows, fuzzyCount] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        isFeatured: products.isFeatured,
        brandName: brands.name,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        soldCount: products.soldCount,
        primaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        primaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = true
            AND  pi.variant_id IS NULL
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        secondaryImageUrl: sql<string | null>`(
          SELECT pi.url FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        secondaryImageAlt: sql<string | null>`(
          SELECT pi.alt FROM ${productImages} pi
          WHERE  pi.product_id = ${products.id}
            AND  pi.is_primary = false
          ORDER  BY pi.sort_order LIMIT 1
        )`,
        colors: sql<
          Array<{ color: string; hex: string | null; imageUrl?: string | null }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'color', c.color,
                'hex', c.color_hex,
                'imageUrl', c.image_url
              )
            ),
            '[]'::json
          )
          FROM (
            SELECT DISTINCT ON (pv.color) 
              pv.color, 
              pv.color_hex,
              (
                SELECT pi.url 
                FROM ${productImages} pi 
                WHERE pi.variant_id = pv.id 
                ORDER BY pi.sort_order 
                LIMIT 1
              ) as image_url
            FROM ${productVariants} pv
            WHERE pv.product_id = ${products.id}
              AND pv.is_active = true
            ORDER BY pv.color
          ) c
        )`,
        variants: sql<
          Array<{
            id: string;
            size: string;
            color: string;
            price: string;
            isAvailable: boolean;
          }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'size', pv.size,
                'color', pv.color,
                'price', pv.price::text,
                'isAvailable', (inv.quantity - inv.reserved_quantity) > 0
              )
              ORDER BY pv.sort_order ASC, pv.size ASC
            ),
            '[]'::json
          )
          FROM ${productVariants} pv
          JOIN ${inventory} inv ON inv.variant_id = pv.id
          WHERE pv.product_id = ${products.id}
            AND pv.is_active = true
        )`,
        minPrice: sql<string>`(
          SELECT MIN(pv.price)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id} AND pv.is_active = true
        )`,
        minMrp: sql<string>`(
          SELECT MIN(pv.mrp)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products.id} AND pv.is_active = true
        )`,
        isInStock: sql<boolean>`true`,
        rank: sql<number>`similarity(${products.name}, ${q})`,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...fuzzyConditions))
      .orderBy(desc(sql`similarity(${products.name}, ${q})`))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(and(...fuzzyConditions)),
  ]);

  const total = fuzzyCount[0]?.count ?? 0;

  return {
    products: fuzzyRows.map(toProductListItem),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    isFuzzy: true,
  };
}

// ─────────────────────────────────────────────────────────────────────
// getSearchSuggestions
// ─────────────────────────────────────────────────────────────────────

export async function getSearchSuggestions(
  rawQuery: string
): Promise<SearchSuggestionsResult> {
  const q = rawQuery.trim();
  if (!q) {
    return {
      query: "",
      categories: [],
      suggestions: [],
      products: [],
      totalMatches: 0,
    };
  }

  const normalizedQ = q.toLowerCase();

  // Run parallel fetches for categories, top products, and keyword matches
  const [activeCategories, previewResult, keywordRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        path: categories.path,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .catch(() => []),

    searchProducts({ q, limit: 3 }).catch(() => ({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
      isFuzzy: false,
    })),

    db
      .select({
        name: products.name,
        tags: products.tags,
      })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${q}%`),
            sql`EXISTS (SELECT 1 FROM unnest(${products.tags}) tag WHERE tag ILIKE ${"%" + q + "%"})`
          )
        )
      )
      .limit(10)
      .catch(() => []),
  ]);

  // 1. Scoped Category suggestions (Zivame pattern: e.g. "bras upto 60% off in SALE")
  const categorySuggestions: SearchSuggestionsResult["categories"] = [
    {
      label: `${q} upto 65% off`,
      categoryName: "SALE",
      href: `/sale?q=${encodeURIComponent(q)}`,
    },
    {
      label: q,
      categoryName: "NEW ARRIVALS",
      href: `/search?q=${encodeURIComponent(q)}&sort=newest`,
    },
  ];

  for (const cat of activeCategories) {
    const catLower = cat.name.toLowerCase();
    if (
      catLower.includes(normalizedQ) ||
      normalizedQ.includes(catLower) ||
      previewResult.products.some(
        (p) =>
          p.slug.toLowerCase().includes(cat.slug.toLowerCase()) ||
          p.name.toLowerCase().includes(catLower)
      )
    ) {
      categorySuggestions.push({
        label: q,
        categoryName: cat.name.toUpperCase(),
        href: `/${cat.slug}?q=${encodeURIComponent(q)}`,
      });
    }
  }

  // 2. Keyword suggestions derived from matching product titles and tags
  const rawKeywords: string[] = [];

  for (const row of keywordRows) {
    if (row.name && row.name.toLowerCase().includes(normalizedQ)) {
      rawKeywords.push(row.name);
    }
    if (Array.isArray(row.tags)) {
      for (const tag of row.tags) {
        if (tag.toLowerCase().includes(normalizedQ)) {
          rawKeywords.push(tag);
        }
      }
    }
  }

  // Common attribute prefixes if query matches innerwear terms
  const curatedAttributes = [
    `backless ${q}`,
    `lace ${q}`,
    `full coverage ${q}`,
    `cotton ${q}`,
    `seamless ${q}`,
    `padded ${q}`,
  ];

  for (const attr of curatedAttributes) {
    if (!rawKeywords.some((k) => k.toLowerCase() === attr.toLowerCase())) {
      rawKeywords.push(attr);
    }
  }

  const uniqueSuggestions = Array.from(new Set(rawKeywords))
    .filter(
      (k) => k.trim().length > 0 && k.trim().toLowerCase() !== normalizedQ
    )
    .slice(0, 6)
    .map((text) => ({
      text,
      href: `/search?q=${encodeURIComponent(text)}`,
    }));

  return {
    query: q,
    categories: categorySuggestions.slice(0, 4),
    suggestions: uniqueSuggestions,
    products: previewResult.products,
    totalMatches: previewResult.total,
  };
}

// ─────────────────────────────────────────────────────────────────────
// getFeaturedProducts
// ─────────────────────────────────────────────────────────────────────

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductListItem[]> {
  const result = await listProducts({
    featuredOnly: true,
    sort: "popular",
    limit,
    page: 1,
  });
  return result.products;
}

// ─────────────────────────────────────────────────────────────────────
// getRelatedProducts
// ─────────────────────────────────────────────────────────────────────

export async function getRelatedProducts(
  currentProductId: string,
  categoryPath: string,
  limit = 4
): Promise<ProductListItem[]> {
  const conditions = [
    eq(products.isActive, true),
    sql`${products.categoryPath} LIKE ${categoryPath + "%"}`,
    sql`${products.id} != ${currentProductId}`,
    sql`EXISTS (
      SELECT 1 FROM ${productVariants} pv
      WHERE pv.product_id = ${products.id} AND pv.is_active = true
    )`,
  ];

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      isFeatured: products.isFeatured,
      brandName: brands.name,
      ratingAvg: products.ratingAvg,
      ratingCount: products.ratingCount,
      soldCount: products.soldCount,
      primaryImageUrl: sql<string | null>`(
        SELECT pi.url FROM ${productImages} pi
        WHERE  pi.product_id = ${products.id}
          AND  pi.is_primary = true
          AND  pi.variant_id IS NULL
        ORDER  BY pi.sort_order LIMIT 1
      )`,
      primaryImageAlt: sql<string | null>`(
        SELECT pi.alt FROM ${productImages} pi
        WHERE  pi.product_id = ${products.id}
          AND  pi.is_primary = true
          AND  pi.variant_id IS NULL
        ORDER  BY pi.sort_order LIMIT 1
      )`,
      secondaryImageUrl: sql<string | null>`(
        SELECT pi.url FROM ${productImages} pi
        WHERE  pi.product_id = ${products.id}
          AND  pi.is_primary = false
        ORDER  BY pi.sort_order LIMIT 1
      )`,
      secondaryImageAlt: sql<string | null>`(
        SELECT pi.alt FROM ${productImages} pi
        WHERE  pi.product_id = ${products.id}
          AND  pi.is_primary = false
        ORDER  BY pi.sort_order LIMIT 1
      )`,
      colors: sql<
        Array<{ color: string; hex: string | null; imageUrl?: string | null }>
      >`(
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'color', c.color,
              'hex', c.color_hex,
              'imageUrl', c.image_url
            )
          ),
          '[]'::json
        )
        FROM (
          SELECT DISTINCT ON (pv.color) 
            pv.color, 
            pv.color_hex,
            (
              SELECT pi.url 
              FROM ${productImages} pi 
              WHERE pi.variant_id = pv.id 
              ORDER BY pi.sort_order 
              LIMIT 1
            ) as image_url
          FROM ${productVariants} pv
          WHERE pv.product_id = ${products.id}
            AND pv.is_active = true
          ORDER BY pv.color
        ) c
      )`,
      variants: sql<
        Array<{
          id: string;
          size: string;
          color: string;
          price: string;
          isAvailable: boolean;
        }>
      >`(
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', pv.id,
              'size', pv.size,
              'color', pv.color,
              'price', pv.price::text,
              'isAvailable', (inv.quantity - inv.reserved_quantity) > 0
            )
            ORDER BY pv.sort_order ASC, pv.size ASC
          ),
          '[]'::json
        )
        FROM ${productVariants} pv
        JOIN ${inventory} inv ON inv.variant_id = pv.id
        WHERE pv.product_id = ${products.id}
          AND pv.is_active = true
      )`,
      minPrice: sql<string>`(
        SELECT MIN(pv.price)::text FROM ${productVariants} pv
        WHERE  pv.product_id = ${products.id} AND pv.is_active = true
      )`,
      minMrp: sql<string>`(
        SELECT MIN(pv.mrp)::text FROM ${productVariants} pv
        WHERE  pv.product_id = ${products.id} AND pv.is_active = true
      )`,
      isInStock: sql<boolean>`EXISTS (
        SELECT 1 FROM ${productVariants} pv
        JOIN   ${inventory} inv ON inv.variant_id = pv.id
        WHERE  pv.product_id = ${products.id}
          AND  pv.is_active  = true
          AND  (inv.quantity - inv.reserved_quantity) > 0
      )`,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions))
    .orderBy(desc(products.soldCount), desc(products.ratingCount))
    .limit(limit);

  return rows.map(toProductListItem);
}

// ─────────────────────────────────────────────────────────────────────
// getAvailableFilters
// ─────────────────────────────────────────────────────────────────────

export async function getAvailableFilters(categoryPath?: string): Promise<{
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: Array<{ slug: string; name: string }>;
  priceRange: { min: number; max: number };
}> {
  const productCondition = categoryPath
    ? and(
        eq(products.isActive, true),
        sql`${products.categoryPath} LIKE ${categoryPath + "%"}`
      )
    : eq(products.isActive, true);

  const [sizes, colors, brandRows, priceRange] = await Promise.all([
    db
      .selectDistinct({ size: productVariants.size })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(productVariants.isActive, true),
          sql`${productVariants.size} IS NOT NULL`,
          productCondition
        )
      )
      .orderBy(asc(productVariants.size)),

    db
      .selectDistinct({
        name: productVariants.color,
        hex: productVariants.colorHex,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(productVariants.isActive, true),
          sql`${productVariants.color} IS NOT NULL`,
          productCondition
        )
      )
      .orderBy(asc(productVariants.color)),

    db
      .selectDistinct({ slug: brands.slug, name: brands.name })
      .from(brands)
      .innerJoin(products, eq(products.brandId, brands.id))
      .where(and(eq(brands.isActive, true), productCondition))
      .orderBy(asc(brands.name)),

    db
      .select({
        min: sql<number>`MIN(${productVariants.price})::numeric`,
        max: sql<number>`MAX(${productVariants.price})::numeric`,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(and(eq(productVariants.isActive, true), productCondition)),
  ]);

  return {
    sizes: sizes.map((r) => r.size!).filter((s): s is string => Boolean(s)),
    colors: colors
      .filter((r): r is { name: string; hex: string | null } => Boolean(r.name))
      .map((r) => ({ name: r.name, hex: r.hex ?? null })),
    brands: brandRows,
    priceRange: {
      min: Math.floor(priceRange[0]?.min ?? 0),
      max: Math.ceil(priceRange[0]?.max ?? 10000),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brandName: string | null | undefined;
  primaryImageUrl: string | null;
  primaryImageAlt: string | null;
  secondaryImageUrl?: string | null;
  secondaryImageAlt?: string | null;
  colors?: Array<{
    color: string;
    hex: string | null;
    imageUrl?: string | null;
  }> | null;
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    price: string;
    isAvailable: boolean;
  }> | null;
  isFeatured?: boolean;
  minPrice: string | null;
  minMrp: string | null;
  isInStock: boolean;
  ratingAvg: string;
  ratingCount: number;
  soldCount: number;
  rank?: number;
};

function toProductListItem(row: ProductRow): ProductListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandName: row.brandName ?? null,
    primaryImage: row.primaryImageUrl
      ? { url: row.primaryImageUrl, alt: row.primaryImageAlt ?? null }
      : null,
    secondaryImage: row.secondaryImageUrl
      ? { url: row.secondaryImageUrl, alt: row.secondaryImageAlt ?? null }
      : null,
    colors: row.colors ?? [],
    variants: row.variants ?? [],
    isFeatured: row.isFeatured ?? false,
    minPrice: row.minPrice ?? "0",
    minMrp: row.minMrp ?? "0",
    isInStock: row.isInStock,
    ratingAvg: row.ratingAvg,
    ratingCount: row.ratingCount,
    soldCount: row.soldCount,
  };
}

/**
 * Single indexed FK lookup on product_variants to get the parent product ID.
 */
export async function getProductIdByVariantId(
  variantId: string
): Promise<string | null> {
  const row = await db
    .select({ productId: productVariants.productId })
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  return row[0]?.productId ?? null;
}
