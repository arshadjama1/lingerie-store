import { z } from "zod";

export const AddToWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
});

export const SyncWishlistSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional().nullable(),
    })
  ),
});

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>;
export type SyncWishlistInput = z.infer<typeof SyncWishlistSchema>;

export interface WishlistProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: string;
  mrp: string;
  isInStock: boolean;
  availableStock: number;
}

export interface WishlistItemProduct {
  id: string;
  slug: string;
  name: string;
  selectedColor?: string | null;
  colorName?: string | null;
  brandName: string | null;
  primaryImage: { url: string; alt: string | null } | null;
  minPrice: string;
  minMrp: string;
  isInStock: boolean;
  ratingAvg: string;
  ratingCount: number;
  variants: WishlistProductVariant[];
}

export interface WishlistItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  addedAt: string;
  product: WishlistItemProduct;
  selectedVariant?: WishlistProductVariant | null;
}
