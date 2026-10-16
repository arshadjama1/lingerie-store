"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { useIsWishlisted, useWishlistStore } from "@/stores/useWishlistStore";
import { Check, Heart, Loader2, ShoppingBag, Star, X } from "lucide-react";

import { calcDiscount, cn, formatPrice } from "@/lib/utils";

import { SIZE_ORDER } from "@/modules/catalog/constants";
import type { ProductListItem } from "@/modules/catalog/types";

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean; // true for above-the-fold images
  className?: string;
}

export function ProductCard({
  product,
  priority = false,
  className,
}: ProductCardProps) {
  const hasDiscount = calcDiscount(product.minPrice, product.minMrp) > 0;
  const isWishlisted = useIsWishlisted(
    product.id,
    product.selectedColor,
    product.variants?.[0]?.id
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [isSizePickerOpen, setIsSizePickerOpen] = useState(false);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
        "group relative flex flex-col overflow-hidden rounded-none border border-stone-200/70 bg-white transition-all duration-300 hover:border-stone-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
              onLoad={() => setIsImageLoaded(true)}
              className={cn(
                "object-cover transition-all duration-500 ease-out will-change-transform group-hover:scale-105",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              No Image
            </div>
          )}
        </Link>

        {/* Badges — Top Left (Discount & Sold out) */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {hasDiscount && (
            <span className="rounded-none bg-white/95 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent-dark)] shadow-xs ring-1 ring-rose-200/60 backdrop-blur-xs">
              {calcDiscount(product.minPrice, product.minMrp)}% OFF
            </span>
          )}
          {!product.isInStock && (
            <span className="rounded-none bg-stone-900/85 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-xs backdrop-blur-xs">
              Sold Out
            </span>
          )}
        </div>

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
            toggleWishlist(
              {
                ...product,
                parentProductId: product.parentProductId,
                selectedColor: product.selectedColor,
              },
              product.variants?.[0]?.id
            );
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

        {/* Desktop Quick Add Bar — slides up on hover */}
        {product.isInStock && (
          <div className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 opacity-0 transition-all duration-200 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block">
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
                "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none px-3 py-2.5 text-xs font-bold tracking-wide shadow-md backdrop-blur-md transition-all active:scale-[0.98]",
                justAddedId
                  ? "bg-emerald-600 text-white"
                  : "bg-white/95 text-stone-900 hover:bg-[var(--accent)] hover:text-white"
              )}
              aria-label={`Add ${product.name} to cart`}
            >
              {addingVariantId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : justAddedId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span className="text-white">Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>{hasMultipleSizes ? "Select Size" : "Quick Add"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        {/* Brand & Name Link */}
        <Link
          href={productHref}
          className="group/link flex flex-col gap-0.5 focus-visible:outline-none"
        >
          {product.brandName && (
            <p className="text-[10px] font-semibold tracking-[0.16em] text-stone-400 uppercase">
              {product.brandName}
            </p>
          )}

          <div>
            <h3 className="line-clamp-1 text-xs font-semibold text-stone-900 transition-colors group-hover/link:text-[var(--accent)] sm:text-sm">
              {product.name}
            </h3>
            {product.selectedColor && (
              <p className="mt-0.5 text-[11px] font-normal text-stone-500 capitalize">
                {product.selectedColor}
              </p>
            )}
          </div>
        </Link>

        {/* Price & Rating Row */}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2.5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-bold text-stone-900 sm:text-base">
              {formatPrice(product.minPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-normal text-stone-400 line-through">
                {formatPrice(product.minMrp)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-[11px] font-bold text-[var(--accent)]">
                {calcDiscount(product.minPrice, product.minMrp)}% off
              </span>
            )}
          </div>

          {/* Rating Stars & Count */}
          {Number(product.ratingCount) > 0 &&
            parseFloat(product.ratingAvg || "0") > 0 && (
              <div className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-stone-700">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{parseFloat(product.ratingAvg).toFixed(1)}</span>
              </div>
            )}
        </div>

        {/* Mobile-only Clean Quick Add Button */}
        <div className="mt-2.5 md:hidden">
          {!product.isInStock ? (
            <div className="w-full rounded-none bg-stone-100 py-2 text-center text-[10px] font-bold text-stone-400 uppercase select-none">
              Sold Out
            </div>
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
                "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none px-3 py-2 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]",
                justAddedId
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-900 text-white hover:bg-neutral-800"
              )}
              aria-label={`Add ${product.name} to cart`}
            >
              {addingVariantId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : justAddedId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>
                    {hasMultipleSizes ? "Select Size" : "Add to Cart"}
                  </span>
                </>
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
            className="animate-in fade-in-0 zoom-in-95 absolute inset-x-2 bottom-3 z-30 flex flex-col rounded-none border border-stone-200 bg-white p-3.5 shadow-2xl duration-200"
            // Handle Escape locally — avoids attaching a global window listener
            // per card instance (costly on pages with many product cards).
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsSizePickerOpen(false);
            }}
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
