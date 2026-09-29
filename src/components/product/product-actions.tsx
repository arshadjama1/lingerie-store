"use client";

import React, { useMemo, useRef, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { useFitStore } from "@/stores/useFitStore";
import { useIsWishlisted, useWishlistStore } from "@/stores/useWishlistStore";
import {
  Check,
  Heart,
  Lock,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

import type { ProductDetail } from "@/modules/catalog/types";

import { OffersCard } from "./OffersCard";
import { PincodeChecker } from "./PincodeChecker";
import { ProductGallery } from "./ProductGallery";
import { SizeGuideModal } from "./SizeGuideModal";
import { StickyMobileBar } from "./StickyMobileBar";

interface ProductActionsProps {
  product: ProductDetail;
  initialColor?: string;
}

export function ProductActions({ product, initialColor }: ProductActionsProps) {
  const { addItem, isLoading: isCartLoading } = useCartStore();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const fitResult = useFitStore((state) => state.result);

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const sizeSectionRef = useRef<HTMLDivElement>(null);

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

  // Initial states
  const matchedInitialColor = useMemo(() => {
    if (initialColor) {
      const match = colorMap.find(
        (c) => c.name.toLowerCase() === initialColor.toLowerCase()
      );
      if (match) return match.name;
    }
    return colorMap[0]?.name || undefined;
  }, [colorMap, initialColor]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    matchedInitialColor
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    allSizes.length === 1 ? allSizes[0] : undefined
  );

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

  const isWishlisted = useIsWishlisted(
    product.id,
    selectedColor,
    selectedVariant?.id
  );

  // Get gallery images deduplicated
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

  // Color click helper
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const nextColorVariants = product.variants.filter((v) => v.color === color);
    const hasSize = nextColorVariants.some(
      (v) => v.size === selectedSize && v.available > 0
    );
    if (!hasSize) {
      setSelectedSize(undefined);
    }
  };

  const handleShare = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const isOutOfStock = selectedVariant
    ? selectedVariant.available === 0
    : false;
  const isLowStock =
    selectedVariant &&
    selectedVariant.available > 0 &&
    selectedVariant.available <= 5;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.variants[0]?.price || "0";

  const currentMrp = selectedVariant
    ? selectedVariant.mrp
    : product.variants[0]?.mrp || currentPrice;

  const discountPercent =
    Number(currentMrp) > Number(currentPrice)
      ? Math.round(
          ((Number(currentMrp) - Number(currentPrice)) / Number(currentMrp)) *
            100
        )
      : 0;

  const badge = product.tags.includes("best-seller")
    ? "BESTSELLER"
    : product.isFeatured
      ? "FEATURED"
      : null;

  const fabricTag =
    product.attributes?.fabric ||
    (product.tags.includes("bamboo")
      ? "95% BAMBOO"
      : product.tags.includes("modal")
        ? "95% MODAL"
        : product.tags.includes("seamless")
          ? "SEAMLESS"
          : null);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(selectedVariant.id, 1);
    }
  };

  // Calculate if the user has a matching FitCode recommended size
  const recommendedSize = useMemo(() => {
    if (!fitResult) return null;
    if (allSizes.includes(fitResult.alphaSize)) return fitResult.alphaSize;
    if (allSizes.includes(fitResult.fullSize)) return fitResult.fullSize;
    return null;
  }, [allSizes, fitResult]);

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
      {/* 1. Gallery Column (7 cols on desktop) */}
      <div className="lg:col-span-7">
        <ProductGallery
          images={galleryImages}
          productName={product.name}
          badge={badge}
          fabricTag={fabricTag}
        />
      </div>

      {/* 2. Interactive Selection Column (5 cols on desktop) */}
      <div className="flex flex-col gap-6 lg:col-span-5">
        {/* Title, Brand, Category, Rating & Share */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-widest text-[var(--accent)] uppercase">
              {product.brand?.name || "Surekh"} ·{" "}
              {product.category?.name || "Intimates"}
            </span>

            <button
              onClick={handleShare}
              className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-gray-500 transition hover:text-gray-900"
              title="Share product"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <h1 className="mt-1.5 font-serif text-2xl leading-tight font-black text-gray-900 sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          {/* Social Proof / Rating Snippet */}
          <div className="mt-2.5 flex items-center gap-3">
            {product.ratingCount > 0 && Number(product.ratingAvg) > 0 ? (
              <div className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span className="text-xs font-black text-amber-900">
                  {parseFloat(product.ratingAvg).toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-none border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-black tracking-wider text-[var(--accent)] uppercase">
                New Arrival
              </span>
            )}
            <a
              href="#reviews-section"
              className="text-xs font-medium text-gray-500 underline transition hover:text-[var(--accent)]"
            >
              {product.ratingCount > 0
                ? `${product.ratingCount} ${product.ratingCount === 1 ? "Customer Review" : "Customer Reviews"}`
                : "Be the first to review"}
            </a>
            <span className="text-gray-300">•</span>
            {!isOutOfStock && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3 w-3" /> In Stock
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-4 flex items-baseline gap-3 border-y border-gray-100 py-3">
            <span className="text-3xl font-black tracking-tight text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-base font-medium text-gray-400 line-through">
                  {formatPrice(currentMrp)}
                </span>
                <span className="bg-emerald-100/80 px-2.5 py-0.5 text-xs font-black tracking-wider text-emerald-800 uppercase">
                  {discountPercent}% OFF
                </span>
              </>
            )}
            <span className="ml-auto text-[11px] font-medium text-gray-500">
              MRP incl. of all taxes
            </span>
          </div>
        </div>

        {/* Color Swatch Picker */}
        {colorMap.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                Color:{" "}
                <span className="font-bold text-gray-900">{selectedColor}</span>
              </span>
              <span className="text-[11px] text-gray-500">
                {colorMap.length} {colorMap.length === 1 ? "shade" : "shades"}{" "}
                available
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colorMap.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color.name)}
                    className={cn(
                      "group relative flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-all",
                      isSelected
                        ? "scale-105 ring-2 ring-[var(--accent)] ring-offset-2"
                        : "hover:scale-105 hover:ring-1 hover:ring-gray-300"
                    )}
                    aria-label={`Select Color ${color.name}`}
                    title={color.name}
                  >
                    {color.hex ? (
                      <span
                        className="block h-7 w-7 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-[var(--surface)] text-[10px] font-black text-gray-800 uppercase">
                        {color.name.substring(0, 2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection Grid with Size Guide Trigger */}
        {allSizes.length > 0 && (
          <div
            ref={sizeSectionRef}
            className="flex scroll-mt-28 flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                Select Size:{" "}
                {selectedSize ? (
                  <span className="font-bold text-gray-900">
                    {selectedSize}
                  </span>
                ) : (
                  <span className="font-normal text-gray-400">Choose one</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold tracking-wider text-[var(--accent)] uppercase hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" /> Size Guide & FitCode™
              </button>
            </div>

            {/* FitCode Recommendation Banner */}
            {recommendedSize && (
              <div className="flex items-center justify-between rounded-none border border-pink-200 bg-pink-50/60 px-3 py-1.5 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-gray-800">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Your FitCode™ size:{" "}
                  <strong className="text-[var(--accent)]">
                    {recommendedSize}
                  </strong>
                  {fitResult && fitResult.fullSize !== recommendedSize && (
                    <span className="font-normal text-gray-500">
                      ({fitResult.fullSize})
                    </span>
                  )}
                </span>
                {selectedSize !== recommendedSize && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize(recommendedSize)}
                    className="cursor-pointer text-[11px] font-black text-[var(--accent)] uppercase hover:underline"
                  >
                    Select {recommendedSize}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {allSizes.map((size) => {
                const isSelected = selectedSize === size;
                const isAvailable = sizeAvailability[size];
                const isRecommended = recommendedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                    className={cn(
                      "relative flex h-11 cursor-pointer items-center justify-center text-xs font-black transition-all",
                      isSelected
                        ? "border-2 border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                        : isAvailable
                          ? isRecommended
                            ? "border-2 border-pink-300 bg-pink-50/40 text-gray-900 hover:border-gray-900"
                            : "border border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:shadow-xs"
                          : "cursor-not-allowed border border-dashed border-gray-200 bg-gray-50 text-gray-300"
                    )}
                  >
                    {size}
                    {isRecommended && !isSelected && (
                      <span className="absolute -top-1.5 -right-1 flex h-3.5 items-center bg-[var(--accent)] px-1 text-[8px] font-bold text-white uppercase shadow-xs">
                        Fit
                      </span>
                    )}
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
            <p className="flex items-center gap-1.5 border border-amber-300 bg-amber-50 p-2.5 text-xs font-bold text-amber-800">
              ⚠️ Only {selectedVariant?.available} items left in stock — order
              soon!
            </p>
          )}
          {isOutOfStock && (
            <p className="flex items-center gap-1.5 border border-rose-300 bg-rose-50 p-2.5 text-xs font-bold text-rose-700">
              ❌ This size and color combination is currently sold out.
            </p>
          )}
        </div>

        {/* Add to Bag and Wishlist Controls */}
        <div className="flex gap-3">
          <button
            disabled={
              !selectedSize || isOutOfStock || isCartLoading || !selectedVariant
            }
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 py-4 text-xs font-black tracking-wider uppercase shadow-md transition-all",
              selectedSize && !isOutOfStock && !isCartLoading && selectedVariant
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] hover:shadow-lg active:scale-98"
                : "cursor-not-allowed border border-gray-300 bg-gray-200 text-gray-500"
            )}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
            {isCartLoading
              ? "Adding to Bag..."
              : isOutOfStock
                ? "Out of Stock"
                : !selectedSize
                  ? "Select a Size First"
                  : "Add to Bag"}
          </button>

          <button
            type="button"
            onClick={() => {
              const activeVariant =
                selectedVariant || colorVariants[0] || product.variants[0];
              const colorSlug = selectedColor
                ? selectedColor.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                : undefined;
              const cardId = colorSlug
                ? `${product.id}-${colorSlug}`
                : product.id;
              const targetImage = galleryImages[0]
                ? { url: galleryImages[0].url, alt: galleryImages[0].alt }
                : product.images[0]
                  ? { url: product.images[0].url, alt: product.images[0].alt }
                  : null;

              toggleWishlist(
                {
                  id: cardId,
                  parentProductId: product.id,
                  slug: product.slug,
                  name: product.name,
                  selectedColor: selectedColor || null,
                  colorName: selectedColor || null,
                  brandName: product.brand?.name ?? null,
                  primaryImage: targetImage,
                  minPrice: String(
                    activeVariant?.price ?? product.variants[0]?.price ?? 0
                  ),
                  minMrp: String(
                    activeVariant?.mrp ?? product.variants[0]?.mrp ?? 0
                  ),
                  isInStock: !isOutOfStock,
                  variants: (colorVariants.length > 0
                    ? colorVariants
                    : product.variants
                  ).map((v) => ({
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
                activeVariant?.id
              );
            }}
            className={cn(
              "flex cursor-pointer items-center justify-center border p-4 shadow-xs transition-all active:scale-95",
              isWishlisted
                ? "border-[var(--accent)] bg-pink-50 text-[var(--accent)]"
                : "border-gray-300 text-gray-700 hover:border-[var(--accent)] hover:bg-pink-50 hover:text-[var(--accent)]"
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

        {/* Offers & Coupons Card */}
        <OffersCard />

        {/* Pincode & COD Delivery Checker */}
        <PincodeChecker />

        {/* High-Contrast Trust Badges Box */}
        <div className="space-y-2.5 border border-pink-100 bg-[var(--surface)] p-4 text-xs text-gray-700">
          <div className="flex items-center gap-2.5 font-medium">
            <Truck className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span>
              <strong>Free Express Shipping</strong> in India on orders above{" "}
              ₹1,299
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Hygiene Assured</strong> &amp; 48-hr damage replacement
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

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categoryName={product.category?.name}
        onSelectSize={(size) => setSelectedSize(size)}
      />

      {/* Sticky Mobile Buy Bar */}
      <StickyMobileBar
        productName={product.name}
        price={currentPrice}
        imageUrl={galleryImages[0]?.url}
        selectedSize={selectedSize}
        isOutOfStock={isOutOfStock}
        isLoading={isCartLoading}
        onAddToCart={handleAddToCart}
        onOpenSizePicker={() => {
          if (sizeSectionRef.current) {
            sizeSectionRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            window.scrollTo({ top: 350, behavior: "smooth" });
          }
        }}
      />
    </div>
  );
}
