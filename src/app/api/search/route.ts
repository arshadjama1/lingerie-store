import { NextResponse } from "next/server";

import { z } from "zod";

import { ValidationError, withErrorHandling } from "@/lib/errors";

import { searchCatalog } from "@/modules/catalog";

const querySchema = z.object({
  q: z.string().trim().min(1, "Search query is required").max(200),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional(),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    priceMin: searchParams.get("priceMin") ?? undefined,
    priceMax: searchParams.get("priceMax") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid search parameters"
    );
  }

  const results = await searchCatalog(parsed.data);

  return NextResponse.json(results);
});
