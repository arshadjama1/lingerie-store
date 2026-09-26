import type { MetadataRoute } from "next";

import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.surekh.co.in";

/**
 * Generates /sitemap.xml at request time using live DB data.
 * Includes all active product and category pages alongside static routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/sale`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    {
      url: `${BASE_URL}/legal/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/returns`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // ── Category routes ────────────────────────────────────────────────────────
  const categoryRows = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.isActive, true))
    .catch(() => [] as { slug: string }[]);

  const categoryRoutes: MetadataRoute.Sitemap = categoryRows.map((c) => ({
    url: `${BASE_URL}/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ── Product routes ─────────────────────────────────────────────────────────
  const productRows = await db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isActive, true))
    .catch(() => [] as { slug: string; updatedAt: Date }[]);

  const productRoutes: MetadataRoute.Sitemap = productRows.map((p) => ({
    url: `${BASE_URL}/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
