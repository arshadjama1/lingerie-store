"use client";

import Image from "next/image";
import Link from "next/link";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { Heart } from "lucide-react";

import { calcDiscount, cn, formatPrice } from "@/lib/utils";

import type { ProductListItem } from "@/modules/catalog";

import { RatingStars } from "./rating-stars";

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
  const discount = calcDiscount(product.minPrice, product.minMrp);
  const hasDiscount = discount > 0;
  const hasItem = useWishlistStore((state) => state.hasItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = hasItem(product.id);

  return (
    <article
      className={cn(
        "group hover:shadow-floating-lg relative flex flex-col overflow-hidden rounded-none border border-gray-100 bg-white transition-all hover:border-pink-200",
        className
      )}
    >
      <Link
        href={`/p/${product.slug}`}
        className="block focus-visible:rounded-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none"
        tabIndex={0}
        aria-label={`${product.name}${product.brandName ? ` by ${product.brandName}` : ""} — ${formatPrice(product.minPrice)}`}
      >
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-[var(--surface)]">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}

          {/* Wishlist Button Overlay */}
          <button
            type="button"
            className={cn(
              "absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-xs transition-all active:scale-90",
              isWishlisted
                ? "bg-white text-[var(--accent)] hover:bg-rose-50"
                : "bg-white/90 text-gray-500 hover:bg-white hover:text-[var(--accent)]"
            )}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-transform",
                isWishlisted &&
                  "scale-110 fill-[var(--accent)] text-[var(--accent)]"
              )}
            />
          </button>

          {/* Badges — top left */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {hasDiscount && (
              <span className="rounded-none bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                {discount}% OFF
              </span>
            )}
            {!product.isInStock && (
              <span className="rounded-none bg-black/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3.5">
          {/* Brand */}
          {product.brandName && (
            <p className="text-[10px] font-black tracking-widest text-[var(--accent-dark)] uppercase">
              {product.brandName}
            </p>
          )}

          {/* Product name */}
          <h3 className="line-clamp-2 text-xs leading-snug font-bold text-gray-900 transition-colors group-hover:text-[var(--accent)] sm:text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <RatingStars
              rating={parseFloat(product.ratingAvg)}
              count={product.ratingCount}
              size="sm"
              className="mt-0.5"
            />
          )}

          {/* Price */}
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-sm font-black text-gray-900 sm:text-base">
              {formatPrice(product.minPrice)}
            </span>

            {hasDiscount && (
              <span className="text-xs font-medium text-gray-400 line-through">
                {formatPrice(product.minMrp)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
