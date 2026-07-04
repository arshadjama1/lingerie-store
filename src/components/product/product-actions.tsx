"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

import type { ProductDetail } from "@/modules/catalog/types";

interface ProductActionsProps {
  product: ProductDetail;
}

export function ProductActions({ product }: ProductActionsProps) {
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
    // Simple sort for sizes or keep database sort order
    return Array.from(sizesSet);
  }, [product.variants]);

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

  // Get gallery images. Fallback to product images if variant images are empty.
  const galleryImages = useMemo(() => {
    // If a variant is selected or color is selected, fetch associated images
    if (selectedColor) {
      const activeColorImages = colorVariants.flatMap((v) => v.images);
      if (activeColorImages.length > 0) {
        return activeColorImages;
      }
    }
    return product.images.length > 0
      ? product.images
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
    // If current selected size is not in stock for new color, clear size selection
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
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      {/* 1. Gallery Column */}
      <div className="flex flex-col gap-4">
        {/* Main Image Slider */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[var(--surface)]">
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
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[var(--foreground)] shadow-md transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[var(--foreground)] shadow-md transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <div className="flex scrollbar-thin gap-2.5 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setMainImageIndex(idx)}
                className={cn(
                  "relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded border bg-[var(--surface)] transition",
                  mainImageIndex === idx
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)]"
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
        {/* Editorial Title & Pricing */}
        <div>
          {product.brand && (
            <span className="text-xs font-semibold tracking-widest text-[var(--foreground-muted)] uppercase">
              {product.brand.name}
            </span>
          )}
          <h1 className="mt-1 font-serif text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl">
            {product.name}
          </h1>

          {/* Pricing treatment */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[var(--foreground)]">
              {formatPrice(
                selectedVariant
                  ? selectedVariant.price
                  : product.variants[0]?.price || "0"
              )}
            </span>
            {selectedVariant &&
              Number(selectedVariant.mrp) > Number(selectedVariant.price) && (
                <>
                  <span className="text-base text-[var(--foreground-subtle)] line-through">
                    {formatPrice(selectedVariant.mrp)}
                  </span>
                  <span className="rounded bg-[var(--accent-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-dark)]">
                    {Math.round(
                      ((Number(selectedVariant.mrp) -
                        Number(selectedVariant.price)) /
                        Number(selectedVariant.mrp)) *
                        100
                    )}
                    % off
                  </span>
                </>
              )}
          </div>
        </div>

        {/* Color Swatch Picker */}
        {colorMap.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold tracking-widest text-[var(--foreground-muted)] uppercase">
              Color: {selectedColor}
            </span>
            <div className="flex flex-wrap gap-3">
              {colorMap.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.name)}
                    className={cn(
                      "group relative flex items-center justify-center rounded-full border transition",
                      isSelected
                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border)]"
                    )}
                    aria-label={`Select Color ${color.name}`}
                  >
                    <span className="block rounded-full p-0.5">
                      {color.hex ? (
                        <span
                          className="block h-7 w-7 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)] text-[10px] font-semibold uppercase">
                          {color.name.substring(0, 2)}
                        </span>
                      )}
                    </span>
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
              <span className="text-xs font-semibold tracking-widest text-[var(--foreground-muted)] uppercase">
                Size
              </span>
              <button className="text-xs font-medium text-[var(--accent-dark)] hover:underline">
                Size Guide
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
                      "relative flex h-11 items-center justify-center rounded border text-sm font-medium transition",
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-semibold text-[var(--accent-dark)]"
                        : isAvailable
                          ? "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                          : "cursor-not-allowed border-[var(--border)] bg-gray-50/50 text-[var(--foreground-subtle)]"
                    )}
                  >
                    {size}
                    {/* Diagonal strikethrough for out of stock */}
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

        {/* Stock status warnings & availability alerts */}
        <div>
          {isLowStock && (
            <p className="text-xs font-semibold text-[var(--destructive)]">
              ⚠️ Only {selectedVariant?.available} left — order soon
            </p>
          )}
          {isOutOfStock && (
            <p className="text-xs font-semibold text-[var(--destructive)]">
              ❌ This variant is currently out of stock
            </p>
          )}
        </div>

        {/* Add to Bag and Wishlist Controls */}
        <div className="flex gap-4">
          <button
            disabled={!selectedSize || isOutOfStock}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded py-3 text-sm font-semibold tracking-wider uppercase shadow-sm transition",
              selectedSize && !isOutOfStock
                ? "cursor-pointer bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                : "cursor-not-allowed bg-gray-200 text-[var(--foreground-subtle)]"
            )}
            onClick={() => {
              // Add to Cart logic wired in cart milestone
              alert(`Added SKU ${selectedVariant?.sku} to cart (Simulated)`);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock
              ? "Out of Stock"
              : !selectedSize
                ? "Select Size"
                : "Add to Bag"}
          </button>

          <button
            className="flex items-center justify-center rounded border border-[var(--border)] p-3 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
            aria-label="Add to wishlist"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Trust Labels */}
        <div
          className="space-y-2 border-t pt-4 text-xs text-[var(--foreground-muted)]"
          style={{ borderColor: "var(--border)" }}
        >
          <p>🚚 Free standard delivery in India on orders over ₹999.</p>
          <p>🔄 Free returns and exchanges within 14 days.</p>
          <p>🎁 Gift wrap packaging option available during checkout.</p>
        </div>
      </div>
    </div>
  );
}
