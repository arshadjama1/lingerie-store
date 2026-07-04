import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCatalogProduct } from "@/modules/catalog";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    const product = await getCatalogProduct(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in GET /api/products/[slug]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
