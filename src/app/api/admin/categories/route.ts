import { NextResponse } from "next/server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import { withErrorHandling } from "@/lib/errors";

import { getAdminCategories } from "@/modules/admin/catalog";

export const GET = withErrorHandling(async () => {
  await assertAdmin();

  const categoriesList = await getAdminCategories();

  return NextResponse.json({ categories: categoriesList });
});

export const POST = withErrorHandling(async (req: Request) => {
  await assertAdmin();
  const body = await req.json();
  const { name, slug, parentId, sortOrder = 0, isActive = true } = body;

  let path = slug;
  if (parentId) {
    const parent = await db.query.categories.findFirst({
      where: eq(categories.id, parentId),
    });
    if (parent) {
      path = `${parent.path}/${slug}`;
    }
  }

  const newId = createId();
  const newCategory = {
    id: newId,
    name,
    slug,
    parentId: parentId || null,
    path,
    sortOrder,
    isActive,
  };

  await db.insert(categories).values(newCategory);

  return NextResponse.json({ category: newCategory }, { status: 201 });
});
