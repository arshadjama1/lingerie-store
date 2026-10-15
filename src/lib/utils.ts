import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function calcDiscount(
  price: string | number,
  mrp: string | number
): number {
  const p = typeof price === "string" ? parseFloat(price) : price;
  const m = typeof mrp === "string" ? parseFloat(mrp) : mrp;
  if (!p || !m || m <= 0 || p >= m) return 0;
  return Math.round(((m - p) / m) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function buildQueryString(
  params: Record<string, string | number | string[] | undefined | null>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, v));
    else sp.set(key, String(value));
  }
  const str = sp.toString();
  return str ? `?${str}` : "";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function calculateGST(price: number, mrp: number): number {
  const rate = mrp <= 1000 ? 0.05 : 0.12;
  return Math.round((price - price / (1 + rate)) * 100) / 100;
}

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value);
}

export interface ImageLike {
  url: string;
  isPrimary?: boolean | null;
  alt?: string | null;
  variantId?: string | null;
}

export interface VariantLike {
  id?: string;
  color?: string | null;
  images?: ImageLike[] | null;
}

export interface ProductLike {
  images?: ImageLike[] | null;
}

/**
 * Resolves the most accurate image URL for a given variant and product.
 * Prioritizes:
 * 1. Variant's direct images (primary first, then first image)
 * 2. Product images tagged with this variantId (primary first, then first)
 * 3. Product images matching the variant's color name in alt text or URL
 * 4. Product-level primary image (not tied to a different variant)
 * 5. First available product image
 * 6. Fallback placeholder
 */
export function resolveVariantImageUrl(
  variant?: VariantLike | null,
  product?: ProductLike | null,
  fallback = "/placeholder.jpg"
): string {
  if (!variant && !product) return fallback;

  // 1. Variant's own images
  if (variant?.images && variant.images.length > 0) {
    const primary = variant.images.find((img) => img.isPrimary)?.url;
    if (primary) return primary;
    if (variant.images[0]?.url) return variant.images[0].url;
  }

  const productImages = product?.images ?? [];

  // 2. Product images attached to this variant by variantId
  if (variant?.id && productImages.length > 0) {
    const variantMatches = productImages.filter(
      (img) => img.variantId === variant.id
    );
    if (variantMatches.length > 0) {
      const primary = variantMatches.find((img) => img.isPrimary)?.url;
      if (primary) return primary;
      if (variantMatches[0]?.url) return variantMatches[0].url;
    }
  }

  // 3. Match by variant color in alt or url (case-insensitive)
  if (variant?.color && productImages.length > 0) {
    const colorLower = variant.color.toLowerCase().trim();
    const colorMatches = productImages.filter((img) => {
      const altLower = (img.alt || "").toLowerCase();
      const urlLower = (img.url || "").toLowerCase();
      return altLower.includes(colorLower) || urlLower.includes(colorLower);
    });

    if (colorMatches.length > 0) {
      const primary = colorMatches.find((img) => img.isPrimary)?.url;
      if (primary) return primary;
      if (colorMatches[0]?.url) return colorMatches[0].url;
    }
  }

  // 4. Product primary image (preferably not attached to a different variant)
  if (productImages.length > 0) {
    const productPrimary =
      productImages.find((img) => img.isPrimary && !img.variantId)?.url ||
      productImages.find((img) => img.isPrimary)?.url ||
      productImages[0]?.url;
    if (productPrimary) return productPrimary;
  }

  return fallback;
}
