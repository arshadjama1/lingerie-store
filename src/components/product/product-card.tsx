"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { useIsWishlisted, useWishlistStore } from "@/stores/useWishlistStore";
import { Check, Heart, Loader2, Star, X } from "lucide-react";

import { calcDiscount, cn, formatPrice } from "@/lib/utils";

import type { ProductListItem } from "@/modules/catalog";

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean; // true for above-the-fold images
  className?: string;
}

const SIZE_ORDER: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  "2XL": 6,
  "3XL": 7,
  "4XL": 8,
  "30": 10,
  "30B": 11,
  "30C": 12,
  "30D": 13,
  "32": 20,
  "32A": 21,
  "32B": 22,
  "32C": 23,
  "32D": 24,
  "32DD": 25,
  "32E": 26,
  "34": 30,
  "34A": 31,
  "34B": 32,
  "34C": 33,
  "34D": 34,
  "34DD": 35,
  "34E": 36,
  "36": 40,
  "36A": 41,
  "36B": 42,
  "36C": 43,
  "36D": 44,
  "36DD": 45,
  "36E": 46,
  "38": 50,
  "38A": 51,
  "38B": 52,
  "38C": 53,
  "38D": 54,
  "38DD": 55,
  "38E": 56,
  "40": 60,
  "40A": 61,
  "40B": 62,
  "40C": 63,
  "40D": 64,
  "40DD": 65,
  "40E": 66,
  "42": 70,
  "42A": 71,
  "42B": 72,
  "42C": 73,
  "42D": 74,
  FS: 99,
  "FREE SIZE": 99,
  "ONE SIZE": 99,
};

export function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const hasDiscount = calcDiscount(product.minPrice, product.minMrp) > 0;
  const isWishlisted = useIsWishlisted(product.parentProductId || product.id);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter & sort variants for the product card
  const availableVariants = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];

    let filtered = product.variants;
    if (product.selectedColor) {
      const byColor = product.variants.filter(
        (v) => v.color?.toLowerCase() === product.selectedColor?.toLowerCase()
      );
      if (byColor.length > 0) {
        filtered = byColor;
      }
    } else {
      // Deduplicate sizes for products without a specific color (e.g. packs)
      const seenSizes = new Set<string>();
      filtered = filtered.filter((v) => {
        const s = v.size?.trim().toUpperCase() ?? "";
        if (seenSizes.has(s)) return false;
        seenSizes.add(s);
        return true;
      });
    }

    return [...filtered].sort((a, b) => {
      const orderA = SIZE_ORDER[a.size?.trim().toUpperCase() ?? ""] ?? 50;
      const orderB = SIZE_ORDER[b.size?.trim().toUpperCase() ?? ""] ?? 50;
      if (orderA !== orderB) return orderA - orderB;
      return (a.size ?? "").localeCompare(b.size ?? "");
    });
  }, [product.variants, product.selectedColor]);

  const hasMultipleSizes =
    availableVariants.length > 1 &&
    !availableVariants.every((v) =>
      (v.size || "").toLowerCase().includes("free")
    );

  // Close size picker on Escape key
  useEffect(() => {
    if (!isSizePickerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSizePickerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSizePickerOpen]);

  // Handle Add to Cart
  const handleQuickAdd = async (variantId: string) => {
    if (addingVariantId) return;

    setAddingVariantId(variantId);
    try {
      const success = await addItem(variantId, 1);
      if (success) {
        setJustAddedId(variantId);
        setTimeout(() => {
          setJustAddedId(null);
          setIsSizePickerOpen(false);
        }, 1200);
      }
    } finally {
      setAddingVariantId(null);
    }
  };

  const productHref = product.selectedColor
    ? `/p/${product.slug}?color=${encodeURIComponent(product.selectedColor)}`
    : `/p/${product.slug}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden border border-stone-200/80 bg-white transition-all duration-300 hover:border-stone-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Image Container with Subtle Luxury Zoom */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#faf8f7]">
        <Link
          href={productHref}
          className="block h-full w-full focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
          tabIndex={0}
          aria-label={`${product.name}${product.brandName ? ` by ${product.brandName}` : ""} — ${formatPrice(product.minPrice)}`}
        >
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              No Image
            </div>
          )}
        </Link>

        {/* Luxury Floating Wishlist Button */}
        <button
          type="button"
          className={cn(
            "absolute top-2.5 right-2.5 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-xs backdrop-blur-xs transition-all duration-200 active:scale-90",
            isWishlisted
              ? "bg-rose-50 text-[var(--accent)] ring-1 ring-rose-200 hover:bg-rose-100"
              : "bg-white/85 text-stone-600 hover:bg-white hover:text-[var(--accent)] hover:shadow-md"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist({
              ...product,
              id: product.parentProductId || product.id,
            });
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isWishlisted
                ? "scale-110 fill-current text-[var(--accent)]"
                : "text-stone-600 group-hover/btn:text-[var(--accent)]"
            )}
          />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Brand & Name Link */}
        <Link
          href={productHref}
          className="group/link flex flex-col gap-0.5 focus-visible:outline-none"
        >
          {product.brandName && (
            <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--accent-dark)] uppercase">
              {product.brandName}
            </p>
          )}

          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <h3 className="line-clamp-2 text-xs leading-snug font-semibold text-stone-900 transition-colors group-hover/link:text-[var(--accent)] sm:text-sm">
              {product.name}
            </h3>
            {product.selectedColor && (
              <span className="text-[11px] font-normal whitespace-nowrap text-stone-500">
                ({product.selectedColor})
              </span>
            )}
          </div>
        </Link>

        {/* Bottom Row: Price & Rating on Left, ADD TO CART Button on Right */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          {/* Price & Rating */}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-stone-900 sm:text-base">
                {formatPrice(product.minPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] font-normal text-stone-400 line-through">
                  {formatPrice(product.minMrp)}
                </span>
              )}
            </div>

            {/* Rating Stars & Count */}
            {Number(product.ratingCount) > 0 &&
              parseFloat(product.ratingAvg || "0") > 0 && (
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-stone-800">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{parseFloat(product.ratingAvg).toFixed(1)}</span>
                  <span className="text-[10px] font-normal text-stone-400">
                    ({product.ratingCount})
                  </span>
                </div>
              )}
          </div>

          {/* ADD TO CART Button (Pink Luxury Pill as in Reference Image) */}
          {!product.isInStock ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xs border border-stone-200 bg-stone-100 px-3 py-2 text-[10px] font-bold tracking-wider text-stone-400 uppercase select-none"
            >
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              disabled={addingVariantId !== null}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hasMultipleSizes) {
                  setIsSizePickerOpen((prev) => !prev);
                } else if (availableVariants.length > 0) {
                  const firstAvailable =
                    availableVariants.find((v) => v.isAvailable) ||
                    availableVariants[0];
                  if (firstAvailable) {
                    handleQuickAdd(firstAvailable.id);
                  }
                }
              }}
              className={cn(
                "shrink-0 cursor-pointer rounded-xs px-3.5 py-2 text-[11px] font-extrabold tracking-wider text-white uppercase shadow-xs transition-all active:scale-95",
                justAddedId
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-[var(--accent)] hover:opacity-95"
              )}
              aria-label={`Add ${product.name} to cart`}
            >
              {addingVariantId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : justAddedId ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                "ADD TO CART"
              )}
            </button>
          )}
        </div>
      </div>

      {/* "Select a size" Popover (As shown in Reference Image) */}
      {isSizePickerOpen && (
        <>
          {/* Click-outside backdrop overlay */}
          <div
            className="fixed inset-0 z-20 cursor-default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSizePickerOpen(false);
            }}
          />

          {/* Floating Size Selection Panel */}
          <div
            className="animate-in fade-in-0 zoom-in-95 absolute inset-x-2 bottom-14 z-30 flex flex-col rounded-lg border border-stone-200 bg-white p-3.5 shadow-2xl duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Header: "Select a size" and "✕" */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-semibold text-stone-800">
                Select a size
                {product.selectedColor && (
                  <span className="font-normal text-stone-500 capitalize">
                    {" "}
                    · {product.selectedColor}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsSizePickerOpen(false)}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close size selector"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Circular Size Badges Grid */}
            <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
              {availableVariants.map((variant) => {
                const isAdding = addingVariantId === variant.id;

                if (!variant.isAvailable) {
                  return (
                    <span
                      key={variant.id}
                      title="Out of stock"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-stone-200 bg-stone-50 text-[11px] font-medium text-stone-300 line-through select-none"
                    >
                      {variant.size || "OS"}
                    </span>
                  );
                }

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={addingVariantId !== null}
                    onClick={() => handleQuickAdd(variant.id)}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-300 text-[11px] font-medium text-stone-700 transition-all hover:border-[var(--accent)] hover:bg-rose-50/50 hover:text-[var(--accent)] active:scale-90"
                    aria-label={`Select size ${variant.size}`}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
                    ) : (
                      variant.size || "Add"
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </article>
  );
}
