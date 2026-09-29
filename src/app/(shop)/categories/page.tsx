import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { getCatalogCategories } from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Categories | Surekh Storefront",
  description:
    "Explore our complete range of intimate wear, bras, panties, sets, and loungewear. Handcrafted for supreme comfort and fit.",
};

export default async function CategoriesPage() {
  const categories = await getCatalogCategories().catch(() => []);

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Categories" }];

  const categoryOffers: Record<string, string> = {
    bras: "From ₹400",
    panties: "Pack of 3 @ ₹750",
    sets: "From ₹650",
    loungewear: "Camisoles @ ₹300",
    nightwear: "Coming Soon",
    shapewear: "Coming Soon",
  };

  return (
    <div className="min-h-screen bg-[#faf8f7]/50 pb-20">
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-6 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbs} className="mb-3" />

          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              All Categories
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-stone-500 sm:text-sm">
              Discover our signature collections crafted with bamboo, modal, and
              seamless fabrics. Everyday comfort, naturally.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg sm:p-6"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-50">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-100 font-serif text-xl font-bold text-stone-300">
                    {cat.name}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-base font-bold text-stone-900 transition-colors group-hover:text-pink-600 sm:text-lg">
                    {cat.name}
                  </h2>
                  {categoryOffers[cat.slug] && (
                    <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-pink-700 uppercase sm:text-xs">
                      {categoryOffers[cat.slug]}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Shop {cat.name.toLowerCase()} &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
