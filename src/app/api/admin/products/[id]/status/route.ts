import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { ValidationError, withErrorHandling } from "@/lib/errors";

import { toggleAdminProductStatus } from "@/modules/admin/catalog";

type RouteCtx = { params: Promise<Record<string, string>> };

const statusSchema = z.object({
  field: z.enum(["isActive", "isFeatured"]),
  value: z.boolean(),
});

export const PATCH = withErrorHandling(
  async (req: NextRequest, ctx: RouteCtx) => {
    await assertAdmin();
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const result = statusSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues[0]?.message ?? "Invalid input"
      );
    }
    const { field, value } = result.data;

    await toggleAdminProductStatus(id, field, value);

    revalidatePath("/");
    revalidatePath("/products");

    return NextResponse.json({ success: true });
  }
);
