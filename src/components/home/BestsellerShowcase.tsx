"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Heart } from "lucide-react";

import { formatPrice } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("ALL BESTSELLERS");

  const filteredProducts = products.filter((p) => {
    if (activeTab === "ALL BESTSELLERS") return true;
    if (activeTab === "BRAS") return p.name.toLowerCase().includes("bra");
    if (activeTab === "PANTIES")
      return (
        p.name.toLowerCase().includes("panty") ||
        p.name.toLowerCase().includes("brief")
      );
    if (activeTab === "NIGHTWEAR")
      return (
        p.name.toLowerCase().includes("night") ||
        p.name.toLowerCase().includes("sleep")
      );
    if (activeTab === "ACTIVEWEAR")
      return (
        p.name.toLowerCase().includes("sport") ||
        p.name.toLowerCase().includes("active")
      );
    return true;
  });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
            Bestseller Showcase
          </h2>
          <p className="mt-0.5 text-xs font-light text-gray-500 sm:text-sm">
            Filter by category to discover top-rated picks
          </p>
        </div>

        {/* Category Tabs */}
        <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {PRODUCT_TABS_DATA.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-none px-4 py-2 text-[11px] font-black tracking-wider whitespace-nowrap uppercase transition-all ${
                activeTab === tab
                  ? "scale-105 bg-[var(--accent)] text-white shadow-md"
                  : "border border-gray-200 bg-[var(--surface)] text-gray-700 hover:bg-pink-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-none border border-dashed border-pink-200 bg-[var(--surface)] p-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            No products found in this category tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.slice(0, 8).map((product) => {
            const hasDiscount =
              product.minMrp &&
              parseFloat(product.minMrp) > parseFloat(product.minPrice);
            const discountPercent = hasDiscount
              ? Math.round(
                  ((parseFloat(product.minMrp!) -
                    parseFloat(product.minPrice)) /
                    parseFloat(product.minMrp!)) *
                    100
                )
              : 0;

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
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md backdrop-blur-xs transition-all hover:bg-white hover:text-[var(--accent)]"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-10 rounded-none bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] font-black tracking-widest text-[var(--accent-dark)] uppercase">
                    {product.brandName || "LINGE"}
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
      )}
    </section>
  );
}
