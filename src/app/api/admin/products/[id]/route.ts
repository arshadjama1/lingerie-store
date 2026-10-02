import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

import {
  getAdminProductById,
  updateAdminProduct,
} from "@/modules/admin/catalog";

const priceField = z.coerce
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid price (e.g. 499 or 499.99)");

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1).max(100),
  size: z.string().max(50).nullable().default(null),
  color: z.string().max(50).nullable().default(null),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .default(null),
  price: priceField,
  mrp: priceField,
  weightGrams: z.coerce.number().int().positive().nullable().default(null),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  stock: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(5),
});

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  storagePath: z.string().nullable().default(null),
  alt: z.string().max(255).nullable().default(null),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variantId: z.string().nullable().default(null),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(500),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().nullable().default(null),
  categoryId: z.string().min(1),
  brandId: z.string().nullable().default(null),
  hsnCode: z.string().max(10).nullable().default(null),
  attributes: z.record(z.string(), z.string()).default({}),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(255).nullable().default(null),
  metaDesc: z.string().nullable().default(null),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  images: z.array(imageSchema).default([]),
});

export const GET = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  await assertAdmin();
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id } = await params;

  const product = await getAdminProductById(id);
  if (!product) throw new NotFoundError("Product");

  return NextResponse.json(product);
});

export const PUT = withErrorHandling(async (req: Request, ctx?: unknown) => {
  await assertAdmin();
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id } = await params;

  const body = await (req as NextRequest).json().catch(() => ({}));
  const result = updateProductSchema.safeParse(body);

  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? "Invalid product data";
    throw new ValidationError(msg);
  }

  await updateAdminProduct(id, result.data);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${result.data.slug}`);

  return NextResponse.json({ success: true });
});
