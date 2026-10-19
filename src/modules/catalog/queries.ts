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

import { sortSizesNaturally } from "./constants";
import {
  type CategoryNode,
  type DbCategory,
  type ListProductsParams,
  type ListProductsResult,
  type ProductDetail,
  type ProductListItem,
  type SearchProductsParams,
  type SearchProductsResult,
  type SearchSuggestionsResult,
  type SortOption,
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
    brandSlugs,
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

  const brandList =
    brandSlugs && brandSlugs.length > 0
      ? brandSlugs
      : brandSlug
        ? [brandSlug]
        : undefined;

  if (brandList && brandList.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${brands} b
        WHERE b.id   = ${products.brandId}
          AND b.slug IN (${sql.join(
            brandList.map((b) => sql`${b}`),
            sql`, `
          )})
          AND b.is_active = true
      )`
    );
  }

  const hasVariantFilter =
    (sizes && sizes.length > 0) ||
    (colors && colors.length > 0) ||
    priceMin !== undefined ||
    priceMax !== undefined;

  if (hasVariantFilter) {
    const variantConditions = [
      sql`pv.product_id = ${products}.id`,
      sql`pv.is_active = true`,
    ];

    if (sizes && sizes.length > 0) {
      variantConditions.push(
        sql`UPPER(TRIM(pv.size)) IN (${sql.join(
          sizes.map((s) => sql`UPPER(${s.trim()})`),
          sql`, `
        )})`
      );
    }

    if (colors && colors.length > 0) {
      variantConditions.push(
        sql`LOWER(TRIM(pv.color)) IN (${sql.join(
          colors.map((c) => sql`LOWER(${c.trim()})`),
          sql`, `
        )})`
      );
    }

    if (priceMin !== undefined) {
      variantConditions.push(sql`pv.price >= ${priceMin}`);
    }

    if (priceMax !== undefined) {
      variantConditions.push(sql`pv.price <= ${priceMax}`);
    }

    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${productVariants} pv
        WHERE ${sql.join(variantConditions, sql` AND `)}
      )`
    );
  }

  const whereClause = and(...conditions);

  const orderBy = {
    newest: [desc(products.createdAt)],
    price_asc: [
      asc(sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products}.id AND pv.is_active = true
      )`),
    ],
    price_desc: [
      desc(sql`(
        SELECT MIN(pv.price) FROM ${productVariants} pv
        WHERE pv.product_id = ${products}.id AND pv.is_active = true
      )`),
    ],
    popular: [desc(products.soldCount), desc(products.ratingCount)],
  }[sort];

  // Fetch rows with a bounded cap. Color expansion happens in JS, so we
  // need enough raw products to fill all pages. Cap at 500 raw products
  // (covers ~2000 expanded color-cards) to avoid unbounded over-fetches.
  const MAX_RAW_FETCH = 500;

  const [rows, countRows] = await Promise.all([
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
        primaryImageUrl: sql<string | null>`primary_img.url`,
        primaryImageAlt: sql<string | null>`primary_img.alt`,
        secondaryImageUrl: sql<string | null>`secondary_img.url`,
        secondaryImageAlt: sql<string | null>`secondary_img.alt`,
        colors: sql<
          Array<{
            color: string;
            hex: string | null;
            imageUrl?: string | null;
            secondaryImageUrl?: string | null;
          }>
        >`(
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'color', c.color,
                'hex', c.color_hex,
                'imageUrl', c.primary_url,
                'secondaryImageUrl', c.secondary_url
              ) ORDER BY c.color
            ),
            '[]'::json
          )
          FROM (
            SELECT
              c_inner.color,
              c_inner.color_hex,
              (
                SELECT pi.url FROM ${productImages} pi
                WHERE pi.variant_id = c_inner.var_id AND pi.is_primary = true
                LIMIT 1
              ) as primary_url,
              (
                SELECT pi.url FROM ${productImages} pi
                WHERE pi.variant_id = c_inner.var_id AND pi.is_primary = false
                ORDER BY pi.sort_order LIMIT 1
              ) as secondary_url
            FROM (
              SELECT DISTINCT ON (pv_sub.color) pv_sub.color, pv_sub.color_hex, pv_sub.id as var_id
              FROM ${productVariants} pv_sub
              WHERE pv_sub.product_id = ${products}.id AND pv_sub.is_active = true
              ORDER BY pv_sub.color, pv_sub.sort_order ASC
            ) c_inner
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
          WHERE pv.product_id = ${products}.id
            AND pv.is_active = true
        )`,
        minPrice: sql<string>`(
          SELECT MIN(pv.price)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products}.id
            AND  pv.is_active  = true
        )`,
        minMrp: sql<string>`(
          SELECT MIN(pv.mrp)::text FROM ${productVariants} pv
          WHERE  pv.product_id = ${products}.id
            AND  pv.is_active  = true
        )`,
        isInStock: sql<boolean>`EXISTS (
          SELECT 1 FROM ${productVariants} pv
          JOIN   ${inventory} inv ON inv.variant_id = pv.id
          WHERE  pv.product_id = ${products}.id
            AND  pv.is_active  = true
            AND  (inv.quantity - inv.reserved_quantity) > 0
        )`,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, true),
              isNull(productImages.variantId)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("primary_img"),
        sql`true`
      )
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, false)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("secondary_img"),
        sql`true`
      )
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(MAX_RAW_FETCH),

    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(whereClause),
  ]);

  const rawListItems: ProductListItem[] = rows.map(toProductListItem);
  const expandedList = expandProductItemsByColor(
    rawListItems,
    colors,
    sizes,
    priceMin,
    priceMax,
    sort
  );

  const total = expandedList.length;
  const paginated = expandedList.slice(offset, offset + limit);
  // Use raw DB count for totalPages so it reflects the full catalog size
  // even when expandedList is capped at MAX_RAW_FETCH raw products.
  const rawTotal = countRows[0]?.count ?? total;

  return {
    products: paginated,
    total: rawTotal,
    page,
    totalPages: Math.max(1, Math.ceil(rawTotal / limit)),
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

/**
 * Transforms a raw user search query into a safe, normalized PostgreSQL tsquery string.
 * Supports prefix wildcards, intimate apparel vocabulary / pluralization, and prevents SQL injection / syntax errors.
 */
export function buildSearchTsQuery(rawQuery: string): string {
  const tokens = rawQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "";

  const clauses = tokens
    .map((token, idx) => {
      // Remove any characters that could break tsquery syntax: & | ! ( ) : * ' " \
      let clean = token.replace(/[^a-z0-9]/gi, "");
      if (!clean) return "";

      // Intimate apparel domain synonyms & irregular plural handling
      if (clean === "bras" || clean === "bra") {
        clean = "(bra | bras)";
      } else if (
        [
          "panties",
          "panty",
          "undies",
          "undie",
          "brief",
          "briefs",
          "underwear",
          "boyleg",
          "hipster",
        ].includes(clean)
      ) {
        clean =
          "(panty | panties | undie | undies | underwear | brief | briefs | boyleg | hipster)";
      } else if (["camisoles", "camisole", "cami"].includes(clean)) {
        clean = "(camisole | camisoles | cami)";
      } else if (["bralettes", "bralette"].includes(clean)) {
        clean = "(bralette | bralettes)";
      } else if (["sets", "set"].includes(clean)) {
        clean = "(set | sets)";
      } else if (
        idx === tokens.length - 1 &&
        clean.length >= 2 &&
        !clean.includes("|")
      ) {
        // Only append prefix wildcard to the last word if length >= 2
        clean = `${clean}:*`;
      }

      return clean;
    })
    .filter(Boolean);

  return clauses.join(" & ");
}

export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResult> {
  const {
    q,
    categoryPath,
    priceMin,
    priceMax,
    sort = "relevance",
    page = 1,
    limit = 24,
  } = params;
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

  // ── Phase 1: FTS with Domain Normalization & Prefix Wildcards ────
  const tsquery = buildSearchTsQuery(q);
  const ftsQuerySql = tsquery
    ? sql`to_tsquery('english', ${tsquery})`
    : sql`plainto_tsquery('english', ${q})`;

  const ftsConditions = [
    ...baseConditions,
    sql`${products}.search_vector @@ ${ftsQuerySql}`,
  ];

  // Build sorting order clauses
  const ftsOrderClauses = [];
  switch (sort) {
    case "price_asc":
      ftsOrderClauses.push(
        asc(
          sql`(SELECT MIN(pv.price) FROM ${productVariants} pv WHERE pv.product_id = ${products.id} AND pv.is_active = true)`
        )
      );
      break;
    case "price_desc":
      ftsOrderClauses.push(
        desc(
          sql`(SELECT MIN(pv.price) FROM ${productVariants} pv WHERE pv.product_id = ${products.id} AND pv.is_active = true)`
        )
      );
      break;
    case "newest":
      ftsOrderClauses.push(desc(products.createdAt));
      break;
    case "popular":
      ftsOrderClauses.push(desc(products.soldCount));
      break;
    case "rating":
      ftsOrderClauses.push(
        desc(products.ratingAvg),
        desc(products.ratingCount)
      );
      break;
    case "relevance":
    default:
      ftsOrderClauses.push(
        desc(sql`ts_rank(${products}.search_vector, ${ftsQuerySql})`),
        desc(products.soldCount)
      );
      break;
  }

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
        primaryImageUrl: sql<string | null>`primary_img.url`,
        primaryImageAlt: sql<string | null>`primary_img.alt`,
        secondaryImageUrl: sql<string | null>`secondary_img.url`,
        secondaryImageAlt: sql<string | null>`secondary_img.alt`,
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
          ${ftsQuerySql}
        )`,
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, true),
              isNull(productImages.variantId)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("primary_img"),
        sql`true`
      )
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, false)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("secondary_img"),
        sql`true`
      )
      .where(and(...ftsConditions))
      .orderBy(...ftsOrderClauses)
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

  const fuzzyOrderClauses = [];
  switch (sort) {
    case "price_asc":
      fuzzyOrderClauses.push(
        asc(
          sql`(SELECT MIN(pv.price) FROM ${productVariants} pv WHERE pv.product_id = ${products.id} AND pv.is_active = true)`
        )
      );
      break;
    case "price_desc":
      fuzzyOrderClauses.push(
        desc(
          sql`(SELECT MIN(pv.price) FROM ${productVariants} pv WHERE pv.product_id = ${products.id} AND pv.is_active = true)`
        )
      );
      break;
    case "newest":
      fuzzyOrderClauses.push(desc(products.createdAt));
      break;
    case "popular":
      fuzzyOrderClauses.push(desc(products.soldCount));
      break;
    case "rating":
      fuzzyOrderClauses.push(
        desc(products.ratingAvg),
        desc(products.ratingCount)
      );
      break;
    case "relevance":
    default:
      fuzzyOrderClauses.push(
        desc(sql`similarity(${products.name}, ${q})`),
        desc(products.soldCount)
      );
      break;
  }

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
        primaryImageUrl: sql<string | null>`primary_img.url`,
        primaryImageAlt: sql<string | null>`primary_img.alt`,
        secondaryImageUrl: sql<string | null>`secondary_img.url`,
        secondaryImageAlt: sql<string | null>`secondary_img.alt`,
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
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, true),
              isNull(productImages.variantId)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("primary_img"),
        sql`true`
      )
      .leftJoinLateral(
        db
          .select({ url: productImages.url, alt: productImages.alt })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, products.id),
              eq(productImages.isPrimary, false)
            )
          )
          .orderBy(asc(productImages.sortOrder))
          .limit(1)
          .as("secondary_img"),
        sql`true`
      )
      .where(and(...fuzzyConditions))
      .orderBy(...fuzzyOrderClauses)
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
    totalPages: Math.max(1, Math.ceil(total / limit)),
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

  // 1. Scoped Category suggestions (Prioritize direct category matches)
  const categorySuggestions: SearchSuggestionsResult["categories"] = [];

  // Synonym / stem hints for category matching
  const isPantyQuery =
    normalizedQ.startsWith("pan") ||
    normalizedQ.startsWith("und") ||
    normalizedQ.includes("brief") ||
    normalizedQ.includes("boyleg") ||
    normalizedQ.includes("thong");

  const isBraQuery =
    normalizedQ.startsWith("br") || normalizedQ.includes("bralette");

  const isSetQuery =
    normalizedQ.startsWith("set") || normalizedQ.includes("lingerie");

  const isLoungeQuery =
    normalizedQ.startsWith("lounge") ||
    normalizedQ.startsWith("cami") ||
    normalizedQ.startsWith("night");

  for (const cat of activeCategories) {
    const catLower = cat.name.toLowerCase();
    const matchesExplicit =
      catLower.includes(normalizedQ) || normalizedQ.includes(catLower);
    const matchesSynonym =
      (catLower === "panties" && isPantyQuery) ||
      (catLower === "bras" && isBraQuery) ||
      (catLower === "sets" && isSetQuery) ||
      (catLower === "loungewear" && isLoungeQuery) ||
      (catLower === "nightwear" && isLoungeQuery);

    if (matchesExplicit || matchesSynonym) {
      categorySuggestions.push({
        label: q,
        categoryName: cat.name.toUpperCase(),
        href: `/${cat.slug}?q=${encodeURIComponent(q)}`,
      });
    }
  }

  // Add default discovery scopes
  categorySuggestions.push(
    {
      label: q,
      categoryName: "SALE",
      href: `/sale?q=${encodeURIComponent(q)}`,
    },
    {
      label: q,
      categoryName: "NEW ARRIVALS",
      href: `/search?q=${encodeURIComponent(q)}&sort=newest`,
    }
  );

  // 2. Keyword suggestions derived from matching product titles, tags, and domain terms
  const rawKeywords: string[] = [];

  for (const row of keywordRows) {
    if (row.name) {
      rawKeywords.push(row.name);
    }
    if (Array.isArray(row.tags)) {
      for (const tag of row.tags) {
        if (tag.toLowerCase().includes(normalizedQ)) {
          rawKeywords.push(tag.replace(/-/g, " "));
        }
      }
    }
  }

  // Domain terms dictionary for high-intent suggestions
  const DOMAIN_SUGGESTIONS: Record<string, string[]> = {
    br: [
      "Bamboo Fabric Bra",
      "Padded Lycra Bra",
      "Mischief Lounge Bra",
      "Overlap Bralette Set",
      "Bralettes",
    ],
    bra: [
      "Bamboo Fabric Bra",
      "Padded Lycra Bra",
      "Mischief Lounge Bra",
      "T-Shirt Bra",
      "Bralettes",
    ],
    bras: [
      "Bamboo Fabric Bra",
      "Padded Lycra Bra",
      "Mischief Lounge Bra",
      "T-Shirt Bra",
    ],
    bralette: [
      "Overlap Bralette with Hipster Set",
      "Lace Bralette",
      "Wirefree Bralette",
    ],
    pan: [
      "Seamless Ultra Soft Undie pack of 3",
      "Bamboo Fabric Undie (Pack of 2)",
      "Boyleg Undies",
      "Pack of 3 Floral Undie",
    ],
    panty: [
      "Seamless Undies",
      "Bamboo Fabric Undie (Pack of 2)",
      "Boyleg Undies",
      "Pack of 3 Floral Undie",
    ],
    panties: [
      "Seamless Undies",
      "Bamboo Fabric Undie (Pack of 2)",
      "Boyleg Undies",
      "Pack of 3 Undies",
    ],
    undie: [
      "Bamboo Fabric Undie (Pack of 2)",
      "Boyleg Undies",
      "Seamless Ultra Soft Undie pack of 3",
      "Pack of 3 Floral Undie",
    ],
    undies: [
      "Bamboo Fabric Undie (Pack of 2)",
      "Boyleg Undies",
      "Seamless Ultra Soft Undie pack of 3",
      "Pack of 3 Floral Undie",
    ],
    set: ["Luxuria Pad Lingerie set", "Overlap Bralette with Hipster Set"],
    sets: ["Luxuria Pad Lingerie set", "Overlap Bralette with Hipster Set"],
    seam: [
      "Seamless Ultra Soft Undie pack of 3",
      "Seamless Panties",
      "Seamless Bra",
    ],
    seamless: [
      "Seamless Ultra Soft Undie pack of 3",
      "Seamless Panties",
      "Seamless Bra",
    ],
    bam: [
      "Bamboo Fabric Bra",
      "Bamboo Fabric Undie (Pack of 2)",
      "Bamboo Lounge Bra",
    ],
    bamboo: [
      "Bamboo Fabric Bra",
      "Bamboo Fabric Undie (Pack of 2)",
      "Bamboo Lounge Bra",
    ],
    cot: ["Cotton Camisole", "Cotton Panties", "Cotton Daily Bra"],
    cotton: ["Cotton Camisole", "Cotton Panties", "Cotton Daily Bra"],
    pad: ["Padded Lycra Bra", "Luxuria Pad Lingerie set"],
    padded: ["Padded Lycra Bra", "Luxuria Pad Lingerie set"],
    wire: ["Bamboo Fabric Bra", "Mischief Lounge Bra"],
    wirefree: ["Bamboo Fabric Bra", "Mischief Lounge Bra"],
    cami: ["Camisole", "Cotton Camisole"],
    camisole: ["Camisole", "Cotton Camisole"],
    boy: ["Boyleg Undies"],
    boyleg: ["Boyleg Undies"],
    flor: ["Pack of 3 Floral Undie"],
    floral: ["Pack of 3 Floral Undie"],
  };

  for (const [key, suggestionsList] of Object.entries(DOMAIN_SUGGESTIONS)) {
    if (key.startsWith(normalizedQ) || normalizedQ.startsWith(key)) {
      for (const s of suggestionsList) {
        rawKeywords.push(s);
      }
    }
  }

  // Deduplicate and prioritize suggestions where a word begins with the query
  const seenTexts = new Set<string>();
  const prefixWordMatches: string[] = [];
  const otherMatches: string[] = [];

  for (const raw of rawKeywords) {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed || lower === normalizedQ || seenTexts.has(lower)) {
      continue;
    }
    seenTexts.add(lower);
    const words = lower.split(/[\s-]+/);
    if (words.some((w) => w.startsWith(normalizedQ))) {
      prefixWordMatches.push(trimmed);
    } else {
      otherMatches.push(trimmed);
    }
  }

  const uniqueSuggestions: Array<{ text: string; href: string }> = [];
  for (const trimmed of [...prefixWordMatches, ...otherMatches]) {
    uniqueSuggestions.push({
      text: trimmed,
      href: `/search?q=${encodeURIComponent(trimmed)}`,
    });
    if (uniqueSuggestions.length >= 6) {
      break;
    }
  }

  // Deduplicate product previews
  const seenProductIds = new Set<string>();
  const previewProducts: ProductListItem[] = [];
  for (const prod of previewResult.products) {
    if (!seenProductIds.has(prod.id)) {
      seenProductIds.add(prod.id);
      previewProducts.push(prod);
    }
  }

  return {
    query: q,
    categories: categorySuggestions.slice(0, 4),
    suggestions: uniqueSuggestions,
    products: previewProducts,
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
      primaryImageUrl: sql<string | null>`primary_img.url`,
      primaryImageAlt: sql<string | null>`primary_img.alt`,
      secondaryImageUrl: sql<string | null>`secondary_img.url`,
      secondaryImageAlt: sql<string | null>`secondary_img.alt`,
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
    .leftJoinLateral(
      db
        .select({ url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, products.id),
            eq(productImages.isPrimary, true),
            isNull(productImages.variantId)
          )
        )
        .orderBy(asc(productImages.sortOrder))
        .limit(1)
        .as("primary_img"),
      sql`true`
    )
    .leftJoinLateral(
      db
        .select({ url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, products.id),
            eq(productImages.isPrimary, false)
          )
        )
        .orderBy(asc(productImages.sortOrder))
        .limit(1)
        .as("secondary_img"),
      sql`true`
    )
    .where(and(...conditions))
    .orderBy(desc(products.soldCount), desc(products.ratingCount))
    .limit(limit * 2);

  const rawRelatedItems = rows.map(toProductListItem);
  const expandedRelated = expandProductItemsByColor(rawRelatedItems);
  return expandedRelated.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────
// getAvailableFilters
// ─────────────────────────────────────────────────────────────────────

type AvailableFiltersResult = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: Array<{ slug: string; name: string }>;
  priceRange: { min: number; max: number };
};

const filtersCache = new Map<
  string,
  { timestamp: number; data: AvailableFiltersResult }
>();
const FILTERS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function getAvailableFilters(
  categoryPath?: string
): Promise<AvailableFiltersResult> {
  const cacheKey = categoryPath ?? "__all__";
  const cached = filtersCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < FILTERS_CACHE_TTL_MS) {
    return cached.data;
  }

  const catLike = categoryPath ? `${categoryPath}%` : "%";

  const rows = await db.execute<{
    sizes: string[];
    colors: Array<{ color: string; hex: string | null }>;
    brands: Array<{ slug: string; name: string }>;
    price_range: { min: number | string; max: number | string };
  }>(sql`
    SELECT
      (
        SELECT COALESCE(json_agg(DISTINCT pv.size), '[]'::json)
        FROM ${productVariants} pv
        JOIN ${products} p ON p.id = pv.product_id
        WHERE pv.is_active = true AND pv.size IS NOT NULL AND p.is_active = true AND p.category_path LIKE ${catLike}
      ) as sizes,
      (
        SELECT COALESCE(json_agg(c ORDER BY c.color), '[]'::json)
        FROM (
          SELECT DISTINCT pv.color, pv.color_hex as hex
          FROM ${productVariants} pv
          JOIN ${products} p ON p.id = pv.product_id
          WHERE pv.is_active = true AND pv.color IS NOT NULL AND p.is_active = true AND p.category_path LIKE ${catLike}
        ) c
      ) as colors,
      (
        SELECT COALESCE(json_agg(b ORDER BY b.name), '[]'::json)
        FROM (
          SELECT DISTINCT b.slug, b.name
          FROM ${brands} b
          JOIN ${products} p ON p.brand_id = b.id
          WHERE b.is_active = true AND p.is_active = true AND p.category_path LIKE ${catLike}
        ) b
      ) as brands,
      (
        SELECT json_build_object('min', COALESCE(MIN(pv.price), 0)::numeric, 'max', COALESCE(MAX(pv.price), 5000)::numeric)
        FROM ${productVariants} pv
        JOIN ${products} p ON p.id = pv.product_id
        WHERE pv.is_active = true AND p.is_active = true AND p.category_path LIKE ${catLike}
      ) as price_range
  `);

  const raw = rows[0] || {
    sizes: [],
    colors: [],
    brands: [],
    price_range: { min: 0, max: 5000 },
  };

  const rawSizes = Array.isArray(raw.sizes) ? raw.sizes : [];
  const rawColors = Array.isArray(raw.colors) ? raw.colors : [];
  const rawBrands = Array.isArray(raw.brands) ? raw.brands : [];
  const rawPriceRange = raw.price_range || { min: 0, max: 5000 };

  const result: AvailableFiltersResult = {
    sizes: sortSizesNaturally(rawSizes.filter(Boolean)),
    colors: rawColors
      .filter((c) => Boolean(c?.color))
      .map((c) => ({ name: c.color, hex: c.hex ?? null })),
    brands: rawBrands.filter((b) => Boolean(b?.name)),
    priceRange: {
      min: Math.floor(Number(rawPriceRange.min ?? 0)),
      max: Math.ceil(Number(rawPriceRange.max ?? 5000)),
    },
  };

  filtersCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
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
    secondaryImageUrl?: string | null;
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

export function expandProductItemsByColor(
  items: ProductListItem[],
  filterColors?: string[],
  filterSizes?: string[],
  priceMin?: number,
  priceMax?: number,
  sort?: SortOption
): ProductListItem[] {
  const expanded: ProductListItem[] = [];

  for (const item of items) {
    const isPackOfThree =
      /pack\s*(of|-)\s*(3|three)|(3|three)\s*(-|\s*)pack/i.test(item.name) ||
      /pack.*(3|three)|(3|three).*pack/i.test(item.slug);

    if (isPackOfThree || !item.colors || item.colors.length === 0) {
      if (filterColors && filterColors.length > 0) {
        if (!item.colors || item.colors.length === 0) continue;
        const hasMatchingColor = item.colors.some((c) =>
          filterColors.some(
            (fc) => fc.trim().toLowerCase() === c.color?.trim().toLowerCase()
          )
        );
        if (!hasMatchingColor) continue;
      }

      // Check variant criteria jointly on each variant
      if (
        (filterSizes && filterSizes.length > 0) ||
        priceMin !== undefined ||
        priceMax !== undefined
      ) {
        if (!item.variants || item.variants.length === 0) continue;
        const hasMatchingVariant = item.variants.some((v) => {
          if (filterSizes && filterSizes.length > 0) {
            const matchesSize = filterSizes.some(
              (fs) => fs.trim().toUpperCase() === v.size?.trim().toUpperCase()
            );
            if (!matchesSize) return false;
          }
          const p = parseFloat(v.price);
          if (!isNaN(p)) {
            if (priceMin !== undefined && p < priceMin) return false;
            if (priceMax !== undefined && p > priceMax) return false;
          }
          return true;
        });
        if (!hasMatchingVariant) continue;
      }

      expanded.push(item);
      continue;
    }

    // Filter colors if color filter is specified
    if (filterColors && filterColors.length > 0) {
      const activeColors = item.colors.filter((c) =>
        filterColors.some(
          (fc) => fc.trim().toLowerCase() === c.color?.trim().toLowerCase()
        )
      );
      // If color filter is active but this product has no matching colors, skip!
      if (activeColors.length === 0) continue;

      for (const c of activeColors) {
        processColorCard(c);
      }
    } else {
      for (const c of item.colors) {
        processColorCard(c);
      }
    }

    function processColorCard(
      c: NonNullable<ProductListItem["colors"]>[number]
    ) {
      const colorVariants =
        item.variants?.filter(
          (v) => v.color?.trim().toLowerCase() === c.color?.trim().toLowerCase()
        ) ?? [];

      // Joint variant validation: size AND price on the same variant
      const matchingVariants = colorVariants.filter((v) => {
        if (filterSizes && filterSizes.length > 0) {
          const matchesSize = filterSizes.some(
            (fs) => fs.trim().toUpperCase() === v.size?.trim().toUpperCase()
          );
          if (!matchesSize) return false;
        }
        const p = parseFloat(v.price);
        if (!isNaN(p)) {
          if (priceMin !== undefined && p < priceMin) return false;
          if (priceMax !== undefined && p > priceMax) return false;
        }
        return true;
      });

      // If size or price filter is applied and no variant of this color matches, skip!
      if (
        ((filterSizes && filterSizes.length > 0) ||
          priceMin !== undefined ||
          priceMax !== undefined) &&
        matchingVariants.length === 0
      ) {
        return;
      }

      // Compute minPrice and inStock from the matching variants (or all color variants)
      const targetVariants =
        matchingVariants.length > 0 ? matchingVariants : colorVariants;
      let minP = Infinity;
      let isInStock = false;
      for (const v of targetVariants) {
        const p = parseFloat(v.price);
        if (!isNaN(p) && p < minP) minP = p;
        if (v.isAvailable) isInStock = true;
      }

      const colorSlug = c.color.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      expanded.push({
        ...item,
        id: `${item.id}-${colorSlug}`,
        parentProductId: item.id,
        selectedColor: c.color,
        colorName: c.color,
        primaryImage: c.imageUrl
          ? { url: c.imageUrl, alt: `${item.name} - ${c.color}` }
          : item.primaryImage,
        secondaryImage: c.secondaryImageUrl
          ? { url: c.secondaryImageUrl, alt: `${item.name} - ${c.color}` }
          : null,
        variants: colorVariants.length > 0 ? colorVariants : item.variants,
        minPrice: isFinite(minP) ? minP.toFixed(2) : item.minPrice,
        minMrp: item.minMrp,
        isInStock: colorVariants.length > 0 ? isInStock : item.isInStock,
      });
    }
  }

  // Sort expanded list according to sort option
  if (sort === "price_asc") {
    expanded.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice));
  } else if (sort === "price_desc") {
    expanded.sort((a, b) => parseFloat(b.minPrice) - parseFloat(a.minPrice));
  } else if (sort === "popular") {
    expanded.sort(
      (a, b) =>
        (b.soldCount ?? 0) - (a.soldCount ?? 0) ||
        (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
    );
  }

  return expanded;
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
