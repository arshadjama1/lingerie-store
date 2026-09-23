import { db } from "@/db";
import { productVariants, products, wishlistItems } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, count, desc, eq, or } from "drizzle-orm";
import "server-only";

import { NotFoundError, ValidationError } from "@/lib/errors";

import type {
  AddToWishlistInput,
  WishlistItemProduct,
  WishlistItemWithProduct,
  WishlistProductVariant,
} from "./types";

const MAX_WISHLIST_ITEMS = 100;

export async function getUserWishlist(
  userId: string
): Promise<WishlistItemWithProduct[]> {
  const items = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, userId),
    orderBy: [desc(wishlistItems.addedAt)],
    with: {
      product: {
        with: {
          brand: true,
          images: {
            orderBy: (img, { asc }) => [asc(img.sortOrder)],
          },
          variants: {
            where: eq(productVariants.isActive, true),
            with: {
              inventory: true,
            },
            orderBy: (v, { asc }) => [asc(v.sortOrder), asc(v.price)],
          },
        },
      },
      variant: {
        with: {
          inventory: true,
        },
      },
    },
  });

  const formatted: WishlistItemWithProduct[] = [];

  for (const item of items) {
    const prod = item.product;
    if (!prod || !prod.isActive) continue;

    const rawVariants = prod.variants || [];
    const variants: WishlistProductVariant[] = rawVariants.map((v) => {
      const inv = v.inventory;
      const available = inv
        ? Math.max(0, inv.quantity - inv.reservedQuantity)
        : 0;
      return {
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: v.price,
        mrp: v.mrp,
        isInStock: available > 0,
        availableStock: available,
      };
    });

    const isInStock = variants.some((v) => v.isInStock);
    const minPrice = variants.reduce(
      (min, v) => (Number(v.price) < Number(min) ? v.price : min),
      variants[0]?.price ?? "0"
    );
    const minMrp = variants.reduce(
      (min, v) => (Number(v.mrp) < Number(min) ? v.mrp : min),
      variants[0]?.mrp ?? "0"
    );

    const primaryImg =
      prod.images?.find((img) => img.isPrimary && !img.variantId) ||
      prod.images?.[0] ||
      null;

    const selectedVariant = item.variantId
      ? (variants.find((v) => v.id === item.variantId) ?? null)
      : null;

    const productPayload: WishlistItemProduct = {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      brandName: prod.brand?.name ?? null,
      primaryImage: primaryImg
        ? { url: primaryImg.url, alt: primaryImg.alt ?? prod.name }
        : null,
      minPrice,
      minMrp,
      isInStock,
      ratingAvg: prod.ratingAvg ?? "0",
      ratingCount: prod.ratingCount ?? 0,
      variants,
    };

    formatted.push({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      variantId: item.variantId,
      addedAt:
        item.addedAt instanceof Date
          ? item.addedAt.toISOString()
          : String(item.addedAt),
      product: productPayload,
      selectedVariant,
    });
  }

  return formatted;
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  return rows.map((r) => r.productId);
}

export async function addToWishlist(
  userId: string,
  input: AddToWishlistInput
): Promise<{ id: string; success: boolean }> {
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, input.productId), eq(products.isActive, true)),
    columns: { id: true },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (input.variantId) {
    const variant = await db.query.productVariants.findFirst({
      where: and(
        eq(productVariants.id, input.variantId),
        eq(productVariants.productId, input.productId),
        eq(productVariants.isActive, true)
      ),
      columns: { id: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant");
    }
  }

  // Check count limit
  const [existingCount] = await db
    .select({ count: count() })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  if (existingCount && existingCount.count >= MAX_WISHLIST_ITEMS) {
    const existing = await db.query.wishlistItems.findFirst({
      where: and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, input.productId)
      ),
    });
    if (!existing) {
      throw new ValidationError(
        `Wishlist limit of ${MAX_WISHLIST_ITEMS} items reached`
      );
    }
  }

  const newId = createId();

  const [row] = await db
    .insert(wishlistItems)
    .values({
      id: newId,
      userId,
      productId: input.productId,
      variantId: input.variantId || null,
      addedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [wishlistItems.userId, wishlistItems.productId],
      set: {
        variantId: input.variantId || null,
        addedAt: new Date(),
      },
    })
    .returning({ id: wishlistItems.id });

  return { id: row?.id ?? newId, success: true };
}

export async function removeFromWishlist(
  userId: string,
  targetId: string
): Promise<boolean> {
  const result = await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        or(
          eq(wishlistItems.id, targetId),
          eq(wishlistItems.productId, targetId)
        )
      )
    )
    .returning({ id: wishlistItems.id });

  return result.length > 0;
}

export async function mergeGuestWishlist(
  userId: string,
  items: AddToWishlistInput[]
): Promise<void> {
  if (!items || items.length === 0) return;

  for (const item of items) {
    try {
      await addToWishlist(userId, item);
    } catch {
      // Ignore individual failures (e.g. inactive product or duplicates)
    }
  }
}

export async function clearWishlist(userId: string): Promise<void> {
  await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
}
