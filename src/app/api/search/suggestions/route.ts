import { NextResponse } from "next/server";

import { z } from "zod";

import { withErrorHandling } from "@/lib/errors";

import { getCatalogSearchSuggestions } from "@/modules/catalog";

const querySchema = z.object({
  q: z.string().trim().max(200).default(""),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  const q = parsed.success ? parsed.data.q : "";
  if (!q) {
    return NextResponse.json({
      query: "",
      categories: [],
      suggestions: [],
      products: [],
      totalMatches: 0,
    });
  }

  const results = await getCatalogSearchSuggestions(q);

  return NextResponse.json(results);
});
