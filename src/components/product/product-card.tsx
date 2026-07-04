import Image from "next/image";
import Link from "next/link";

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

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/p/${product.slug}`}
        className="focus-visible:ring-accent block focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        tabIndex={0}
        aria-label={`${product.name}${product.brandName ? ` by ${product.brandName}` : ""} — ${formatPrice(product.minPrice)}`}
      >
        {/* Image container */}
        <div
          className="relative mb-3 overflow-hidden rounded-sm"
          style={{ background: "var(--surface)" }}
        >
          {/* Aspect ratio — 3:4 portrait, standard for apparel */}
          <div className="aspect-[3/4]">
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
              // Placeholder when no image is uploaded yet
              <div className="flex h-full w-full items-center justify-center">
                <svg
                  className="text-foreground-subtle h-12 w-12"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="6"
                    width="36"
                    height="36"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 32 L16 22 L24 30 L32 20 L42 32"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Badges — top left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold tracking-wide"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                {discount}% off
              </span>
            )}
            {!product.isInStock && (
              <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                Sold out
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-0.5">
          {/* Brand */}
          {product.brandName && (
            <p className="text-foreground-muted text-xs font-medium tracking-widest uppercase">
              {product.brandName}
            </p>
          )}

          {/* Product name — serif, restrained line clamp */}
          <h3 className="text-foreground line-clamp-2 font-serif text-sm leading-snug sm:text-base">
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

          {/* Price — the signature treatment */}
          <div className="mt-1.5 flex items-baseline gap-2">
            {/* Current price — large, primary */}
            <span className="text-foreground text-base font-semibold sm:text-lg">
              {formatPrice(product.minPrice)}
            </span>

            {/* MRP — struck through, muted */}
            {hasDiscount && (
              <span
                className="text-foreground-subtle text-sm"
                style={{ textDecoration: "line-through" }}
              >
                {formatPrice(product.minMrp)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
