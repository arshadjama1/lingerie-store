"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { ShoppingBag, Trash2 } from "lucide-react";

import { calcDiscount, cn, formatPrice } from "@/lib/utils";

import type { WishlistItemWithProduct } from "@/modules/wishlist/types";

interface WishlistItemCardProps {
  item: WishlistItemWithProduct;
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { removeItem, moveToBag } = useWishlistStore();
  const [isMoving, setIsMoving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product;
  const variants = product.variants || [];

  // Pick initial variant: either item's chosen variant, or first in-stock variant, or first variant
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => {
      if (item.variantId) return item.variantId;
      const inStock = variants.find((v) => v.isInStock && v.availableStock > 0);
      return inStock?.id || variants[0]?.id || null;
    }
  );

  const activeVariant = variants.find((v) => v.id === selectedVariantId);
  const currentPrice = activeVariant?.price || product.minPrice;
  const currentMrp = activeVariant?.mrp || product.minMrp;
  const discount = calcDiscount(currentPrice, currentMrp);

  const isCurrentInStock = activeVariant
    ? activeVariant.isInStock && activeVariant.availableStock > 0
    : product.isInStock;

  const handleMoveToBag = async () => {
    if (!isCurrentInStock) return;
    setIsMoving(true);
    try {
      await moveToBag(item.id, selectedVariantId || undefined);
    } finally {
      setIsMoving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItem(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-none border border-neutral-200 bg-white transition-all hover:border-pink-200 hover:shadow-md">
      {/* Remove Button Overlay */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="Remove from wishlist"
        className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-400 shadow-xs backdrop-blur-xs transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Image Container */}
      <Link
        href={`/p/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[var(--surface)]"
      >
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {discount > 0 && (
            <span className="rounded-none bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
              {discount}% OFF
            </span>
          )}
          {!isCurrentInStock && (
            <span className="rounded-none bg-neutral-900/85 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        {product.brandName && (
          <p className="text-[10px] font-black tracking-widest text-[var(--accent-dark)] uppercase">
            {product.brandName}
          </p>
        )}

        <Link
          href={`/p/${product.slug}`}
          className="mt-0.5 line-clamp-1 text-sm font-medium text-neutral-900 transition-colors hover:text-[var(--accent)]"
        >
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-neutral-900">
            {formatPrice(currentPrice)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(currentMrp)}
            </span>
          )}
        </div>

        {/* Sizes Selector (if variants exist) */}
        {variants.length > 1 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              Select Size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const isAvailable = v.isInStock && v.availableStock > 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={cn(
                      "h-7 min-w-8 border px-2 text-xs font-semibold uppercase transition-colors",
                      isSelected
                        ? "border-[var(--accent)] bg-pink-50 text-[var(--accent)]"
                        : isAvailable
                          ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                          : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 line-through"
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button: Move to Bag */}
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleMoveToBag}
            disabled={!isCurrentInStock || isMoving}
            className={cn(
              "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-black tracking-wider uppercase transition-colors",
              isCurrentInStock
                ? "cursor-pointer bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] active:scale-[0.99]"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>
              {isMoving
                ? "Moving..."
                : isCurrentInStock
                  ? "Move to Bag"
                  : "Out of Stock"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
