"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { useIsWishlisted, useWishlistStore } from "@/stores/useWishlistStore";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

import type { ProductDetail } from "@/modules/catalog/types";

interface ProductActionsProps {
  product: ProductDetail;
}

export function ProductActions({ product }: ProductActionsProps) {
  const isWishlisted = useIsWishlisted(product.id);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  // Extract all unique colors and sizes from variants
  const colorMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const v of product.variants) {
      if (v.color) {
        map.set(v.color, v.colorHex);
      }
    }
    return Array.from(map.entries()).map(([color, colorHex]) => ({
      name: color,
      hex: colorHex,
    }));
  }, [product.variants]);

  const allSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    for (const v of product.variants) {
      if (v.size) {
        sizesSet.add(v.size);
      }
    }
    return Array.from(sizesSet);
  }, [product.variants]);

  const { addItem, isLoading: isCartLoading } = useCartStore();

  // Initial states
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colorMap[0]?.name || undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  // Filter variants matching selected color
  const colorVariants = useMemo(() => {
    if (!selectedColor) return [];
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  // Check if a size is in stock for the current color
  const sizeAvailability = useMemo(() => {
    const availability: Record<string, boolean> = {};
    for (const size of allSizes) {
      const v = colorVariants.find((cv) => cv.size === size);
      availability[size] = v ? v.available > 0 : false;
    }
    return availability;
  }, [allSizes, colorVariants]);

  // Find exact selected variant if color and size are selected
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return undefined;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Get gallery images
  const galleryImages = useMemo(() => {
    if (selectedColor) {
      const seenUrls = new Set<string>();
      const activeColorImages = colorVariants
        .flatMap((v) => v.images)
        .filter((img) => {
          if (!img?.url || seenUrls.has(img.url)) return false;
          seenUrls.add(img.url);
          return true;
        });
      if (activeColorImages.length > 0) {
        return activeColorImages;
      }
    }
    const seenUrls = new Set<string>();
    const uniqueProductImages = product.images.filter((img) => {
      if (!img?.url || seenUrls.has(img.url)) return false;
      seenUrls.add(img.url);
      return true;
    });
    return uniqueProductImages.length > 0
      ? uniqueProductImages
      : [
          {
            id: "placeholder",
            url: "/placeholder-img.jpg",
            alt: product.name,
            isPrimary: true,
            sortOrder: 0,
            variantId: null,
          },
        ];
  }, [product.images, colorVariants, selectedColor, product.name]);

  // Handle gallery index navigation
  const prevImage = () => {
    setMainImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setMainImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  // Color click helper
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setMainImageIndex(0);
    const nextColorVariants = product.variants.filter((v) => v.color === color);
    const hasSize = nextColorVariants.some(
      (v) => v.size === selectedSize && v.available > 0
    );
    if (!hasSize) {
      setSelectedSize(undefined);
    }
  };

  const isOutOfStock = selectedVariant
    ? selectedVariant.available === 0
    : false;
  const isLowStock =
    selectedVariant &&
    selectedVariant.available > 0 &&
    selectedVariant.available <= 3;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
      {/* 1. Gallery Column */}
      <div className="flex flex-col gap-4">
        {/* Main Image Slider */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none border border-gray-100 bg-[var(--surface)] shadow-md">
          {galleryImages[mainImageIndex] && (
            <Image
              src={galleryImages[mainImageIndex].url}
              alt={galleryImages[mainImageIndex].alt || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
            />
          )}

          {galleryImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-gray-800 shadow-md transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-gray-800 shadow-md transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <div className="flex scrollbar-thin gap-3 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setMainImageIndex(idx)}
                className={cn(
                  "relative aspect-[3/4] w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-none border bg-[var(--surface)] transition",
                  mainImageIndex === idx
                    ? "border-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]"
                    : "border-gray-200 opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Selection Column */}
      <div className="flex flex-col gap-6">
        {/* Title & Pricing Header */}
        <div>
          {product.brand && (
            <p className="text-xs font-black tracking-widest text-[var(--accent-dark)] uppercase">
              {product.brand.name}
            </p>
          )}
          <h1 className="mt-1 font-serif text-2xl leading-tight font-black text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-black text-gray-900 sm:text-3xl">
              {formatPrice(
                selectedVariant
                  ? selectedVariant.price
                  : product.variants[0]?.price || "0"
              )}
            </span>
            {selectedVariant &&
              Number(selectedVariant.mrp) > Number(selectedVariant.price) && (
                <>
                  <span className="text-base font-medium text-gray-400 line-through">
                    {formatPrice(selectedVariant.mrp)}
                  </span>
                  <span className="rounded-none bg-[var(--accent)] px-2.5 py-0.5 text-xs font-black tracking-wider text-white uppercase shadow-xs">
                    {Math.round(
                      ((Number(selectedVariant.mrp) -
                        Number(selectedVariant.price)) /
                        Number(selectedVariant.mrp)) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
          </div>
        </div>

        {/* Color Swatch Picker */}
        {colorMap.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
              Color:{" "}
              <span className="font-bold text-gray-900">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {colorMap.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.name)}
                    className={cn(
                      "group relative flex cursor-pointer items-center justify-center rounded-full border p-0.5 transition",
                      isSelected
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                    aria-label={`Select Color ${color.name}`}
                  >
                    {color.hex ? (
                      <span
                        className="block h-7 w-7 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-black text-gray-800 uppercase">
                        {color.name.substring(0, 2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection Grid */}
        {allSizes.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                Select Size
              </span>
              <button className="flex items-center gap-1 text-xs font-bold tracking-wider text-[var(--accent)] uppercase hover:underline">
                <Sparkles className="h-3.5 w-3.5" /> Size Guide & FitCode™
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
              {allSizes.map((size) => {
                const isSelected = selectedSize === size;
                const isAvailable = sizeAvailability[size];
                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={cn(
                      "relative flex h-11 cursor-pointer items-center justify-center rounded-none border text-xs font-black shadow-xs transition-all",
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                        : isAvailable
                          ? "border-gray-200 bg-white text-gray-900 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                          : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50"
                    )}
                  >
                    {size}
                    {!isAvailable && (
                      <svg
                        className="absolute inset-0 h-full w-full stroke-gray-300"
                        strokeWidth="1.5"
                      >
                        <line x1="0" y1="100%" x2="100%" y2="0" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock alerts */}
        <div>
          {isLowStock && (
            <p className="rounded-none border border-amber-200 bg-amber-50 p-2.5 text-xs font-bold text-amber-600">
              ⚠️ Only {selectedVariant?.available} left in stock — order soon!
            </p>
          )}
          {isOutOfStock && (
            <p className="rounded-none border border-rose-200 bg-rose-50 p-2.5 text-xs font-bold text-rose-600">
              ❌ This size & color combination is currently out of stock.
            </p>
          )}
        </div>

        {/* Add to Bag and Wishlist Controls */}
        <div className="flex gap-3 pt-2">
          <button
            disabled={
              !selectedSize || isOutOfStock || isCartLoading || !selectedVariant
            }
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-none py-4 text-xs font-black tracking-wider uppercase shadow-md transition-all",
              selectedSize && !isOutOfStock && !isCartLoading && selectedVariant
                ? "cursor-pointer bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] hover:shadow-lg"
                : "cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-400"
            )}
            onClick={() => {
              if (selectedVariant) {
                addItem(selectedVariant.id, 1);
              }
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {isCartLoading
              ? "Adding..."
              : isOutOfStock
                ? "Out of Stock"
                : !selectedSize
                  ? "Select a Size First"
                  : "Add to Bag"}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleWishlist(
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  brandName: product.brand?.name ?? null,
                  primaryImage: product.images[0]
                    ? { url: product.images[0].url, alt: product.images[0].alt }
                    : null,
                  minPrice: String(product.variants[0]?.price ?? 0),
                  minMrp: String(product.variants[0]?.mrp ?? 0),
                  isInStock: product.variants.some((v) => v.available > 0),
                  variants: product.variants.map((v) => ({
                    id: v.id,
                    sku: v.sku,
                    size: v.size,
                    color: v.color,
                    price: v.price,
                    mrp: v.mrp,
                    isInStock: v.available > 0,
                    availableStock: v.available,
                  })),
                },
                selectedVariant?.id
              );
            }}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-none border p-4 shadow-xs transition-all active:scale-95",
              isWishlisted
                ? "border-[var(--accent)] bg-pink-50 text-[var(--accent)]"
                : "border-gray-200 text-gray-700 hover:border-[var(--accent)] hover:bg-pink-50 hover:text-[var(--accent)]"
            )}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-200",
                isWishlisted
                  ? "scale-110 fill-current text-[var(--accent)]"
                  : "text-gray-700"
              )}
            />
          </button>
        </div>

        {/* High-Contrast Trust Badges Box */}
        <div className="mt-2 space-y-2.5 rounded-none border border-pink-100 bg-[var(--surface)] p-4 text-xs text-gray-700">
          <div className="flex items-center gap-2.5 font-medium">
            <Truck className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span>
              <strong>Free Express Shipping</strong> in India on orders above
              ₹999
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <RefreshCw className="h-4 w-4 shrink-0 text-sky-600" />
            <span>
              <strong>15-Day Hassle-Free Returns</strong> & size exchange
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>100% Discreet Packaging</strong> in plain unmarked boxes
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0 text-pink-600" />
            <span>
              <strong>Guaranteed Fit Precision</strong> engineered for skin
              comfort
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
