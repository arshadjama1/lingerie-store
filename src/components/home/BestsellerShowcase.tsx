"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { Heart } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

import { PRODUCT_TABS_DATA } from "./data/homeData";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brandName?: string | null;
  minPrice: string;
  minMrp?: string | null;
  primaryImage?: { url: string; alt?: string | null } | null;
}

export function BestsellerShowcase({ products }: { products: ProductItem[] }) {
  const [activeTab, setActiveTab] = useState("ALL");
  const productIds = useWishlistStore((state) => state.productIds);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "BRAS")
      return (
        p.name.toLowerCase().includes("bra") ||
        p.name.toLowerCase().includes("bralette")
      );
    if (activeTab === "PANTIES")
      return (
        p.name.toLowerCase().includes("undie") ||
        p.name.toLowerCase().includes("panty") ||
        p.name.toLowerCase().includes("seamless")
      );
    if (activeTab === "SETS") return p.name.toLowerCase().includes("set");
    if (activeTab === "NIGHTWEAR")
      return (
        p.name.toLowerCase().includes("night") ||
        p.name.toLowerCase().includes("satin") ||
        p.name.toLowerCase().includes("robe")
      );
    if (activeTab === "LOUNGEWEAR")
      return (
        p.name.toLowerCase().includes("lounge") ||
        p.name.toLowerCase().includes("pajama") ||
        p.name.toLowerCase().includes("top") ||
        p.name.toLowerCase().includes("modal")
      );
    return true;
  });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-xs font-black tracking-widest text-[var(--accent-dark)] uppercase">
            Customer Favourites
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Best Sellers
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Our most-loved pieces, chosen by thousands of women across India.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-10 flex scrollbar-none items-center justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
          {PRODUCT_TABS_DATA.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-full px-5 py-2 text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-[var(--accent)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.slice(0, 8).map((product) => {
            const minPrice = parseFloat(product.minPrice);
            const minMrp = product.minMrp ? parseFloat(product.minMrp) : null;
            const hasDiscount = minMrp && minMrp > minPrice;
            const discountPercent = hasDiscount
              ? Math.round(((minMrp - minPrice) / minMrp) * 100)
              : 0;
            const isWishlisted = hasHydrated && productIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="group hover:shadow-floating-lg relative flex flex-col overflow-hidden rounded-none border border-gray-100 bg-white transition-all hover:border-pink-200"
              >
                <div className="relative aspect-[3/4] w-full bg-[var(--surface)]">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                  <button
                    type="button"
                    className={cn(
                      "absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-xs transition-all duration-200 active:scale-90",
                      isWishlisted
                        ? "bg-rose-50 text-[var(--accent)] ring-1 ring-rose-300 hover:bg-rose-100"
                        : "bg-white/90 text-gray-500 hover:bg-white hover:text-[var(--accent)]"
                    )}
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        brandName: product.brandName,
                        primaryImage: product.primaryImage
                          ? {
                              url: product.primaryImage.url,
                              alt: product.primaryImage.alt ?? product.name,
                            }
                          : null,
                        minPrice: product.minPrice,
                        minMrp: product.minMrp || undefined,
                      });
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isWishlisted
                          ? "scale-110 fill-current text-[var(--accent)]"
                          : "text-gray-500 hover:text-[var(--accent)]"
                      )}
                    />
                  </button>
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-none bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] font-black tracking-widest text-[var(--accent-dark)] uppercase">
                    {product.brandName || "Surekh"}
                  </p>
                  <Link
                    href={`/p/${product.slug}`}
                    className="transition-colors hover:text-[var(--accent)]"
                  >
                    <h3 className="mt-0.5 line-clamp-2 text-xs leading-snug font-bold text-gray-900 sm:text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-sm font-black text-gray-900 sm:text-base">
                      {formatPrice(product.minPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.minMrp!)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/p/${product.slug}`}
                    className="mt-3 w-full rounded-none border border-gray-200 bg-[var(--surface)] py-2.5 text-center text-[11px] font-black tracking-wider text-gray-900 uppercase shadow-xs transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                  >
                    SELECT OPTIONS
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
