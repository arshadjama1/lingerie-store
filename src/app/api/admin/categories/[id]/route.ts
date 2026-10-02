import { NextResponse } from "next/server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

import { assertAdmin } from "@/lib/admin-auth";
import { NotFoundError, withErrorHandling } from "@/lib/errors";

export const PATCH = withErrorHandling(
  async (req: Request, props: { params: Promise<{ id: string }> }) => {
    await assertAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existing) {
      throw new NotFoundError("Category");
    }

    // Handle simple status updates
    if (Object.keys(body).length === 1 && "isActive" in body) {
      const [updated] = await db
        .update(categories)
        .set({ isActive: body.isActive })
        .where(eq(categories.id, id))
        .returning();
      return NextResponse.json({ category: updated });
    }

    const { name, slug, parentId, sortOrder, isActive } = body;

    let path = existing.path;
    // If slug or parentId changed, recompute path
    if (slug !== existing.slug || parentId !== existing.parentId) {
      const finalSlug = slug || existing.slug;
      const finalParentId =
        parentId !== undefined ? parentId : existing.parentId;

      if (finalParentId) {
        const parent = await db.query.categories.findFirst({
          where: eq(categories.id, finalParentId),
        });
        if (parent) {
          path = `${parent.path}/${finalSlug}`;
        } else {
          path = finalSlug; // fallback
        }
      } else {
        path = finalSlug;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.path = path;

    const [updated] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ category: updated });
  }
);
