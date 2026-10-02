import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { ValidationError, withErrorHandling } from "@/lib/errors";

import { toggleAdminProductStatus } from "@/modules/admin/catalog";

const statusSchema = z.object({
  field: z.enum(["isActive", "isFeatured"]),
  value: z.boolean(),
});

export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  await assertAdmin();
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id } = await params;

  const body = await (req as NextRequest).json().catch(() => ({}));
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
});
