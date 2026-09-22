import { NextResponse } from "next/server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import { withErrorHandling } from "@/lib/errors";

export const GET = withErrorHandling(async () => {
  await assertAdmin();

  const rows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.name));

  return NextResponse.json({ categories: rows });
});
