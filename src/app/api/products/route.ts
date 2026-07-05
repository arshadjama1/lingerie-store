import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCatalogProducts } from "@/modules/catalog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const categoryPath = searchParams.get("categoryPath") || undefined;
    const brandSlug = searchParams.get("brandSlug") || undefined;
    const priceMinStr = searchParams.get("priceMin");
    const priceMaxStr = searchParams.get("priceMax");
    const sort = searchParams.get("sort") || undefined;
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");
    const featuredOnlyStr = searchParams.get("featuredOnly");

    // Sizes and colors can be passed as multiple parameters (e.g. ?sizes=S&sizes=M)
    const sizes = searchParams.getAll("sizes");
    const colors = searchParams.getAll("colors");

    const params: Record<string, unknown> = {};

    if (categoryPath) params.categoryPath = categoryPath;
    if (brandSlug) params.brandSlug = brandSlug;
    if (sort) params.sort = sort;
    if (sizes.length > 0) params.sizes = sizes;
    if (colors.length > 0) params.colors = colors;

    if (priceMinStr) {
      const priceMin = parseFloat(priceMinStr);
      if (!isNaN(priceMin)) params.priceMin = priceMin;
    }

    if (priceMaxStr) {
      const priceMax = parseFloat(priceMaxStr);
      if (!isNaN(priceMax)) params.priceMax = priceMax;
    }

    if (pageStr) {
      const page = parseInt(pageStr, 10);
      if (!isNaN(page)) params.page = page;
    }

    if (limitStr) {
      const limit = parseInt(limitStr, 10);
      if (!isNaN(limit)) params.limit = limit;
    }

    if (featuredOnlyStr) {
      params.featuredOnly = featuredOnlyStr === "true";
    }

    const data = await getCatalogProducts(params);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
