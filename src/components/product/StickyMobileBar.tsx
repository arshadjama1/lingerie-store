"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import { ShoppingBag } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

interface StickyMobileBarProps {
  productName: string;
  price: string | number;
  imageUrl?: string | null;
  selectedSize?: string;
  isOutOfStock: boolean;
  isLoading: boolean;
  onAddToCart: () => void;
  onOpenSizePicker?: () => void;
}

export function StickyMobileBar({
  productName,
  price,
  imageUrl,
  selectedSize,
  isOutOfStock,
  isLoading,
  onAddToCart,
  onOpenSizePicker,
}: StickyMobileBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick Add to Bag"
      className="fixed right-0 bottom-0 left-0 z-40 block border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md transition-transform duration-300 lg:hidden"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Thumbnail & Details */}
        <div className="flex min-w-0 items-center gap-2.5">
          {imageUrl && (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-gray-200 bg-[var(--surface)]">
              <Image
                src={imageUrl}
                alt={productName}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold text-gray-900">
              {productName}
            </h3>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">
                {formatPrice(price)}
              </span>
              {selectedSize && (
                <span className="py-0.2 bg-gray-100 px-1.5 text-[10px] font-bold text-gray-600">
                  Size: {selectedSize}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Buy Button */}
        <div className="shrink-0">
          <button
            type="button"
            disabled={isOutOfStock || isLoading}
            onClick={() => {
              if (!selectedSize && onOpenSizePicker) {
                onOpenSizePicker();
              } else {
                onAddToCart();
              }
            }}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-black tracking-wider uppercase shadow-md transition-all",
              selectedSize && !isOutOfStock && !isLoading
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] active:scale-95"
                : "bg-gray-900 text-white hover:bg-black"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isLoading
              ? "Adding..."
              : isOutOfStock
                ? "Out of Stock"
                : !selectedSize
                  ? "Select Size"
                  : "Add to Bag"}
          </button>
        </div>
      </div>
    </aside>
  );
}
