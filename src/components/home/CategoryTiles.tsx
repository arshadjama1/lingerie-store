"use client";

import Image from "next/image";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

interface CategoryTile {
  name: string;
  offer: string;
  href: string;
  image: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    name: "Bras",
    offer: "Up to 50% Off",
    href: "/bras",
    image: "/images/home/cat_bras.jpg",
  },
  {
    name: "Panties",
    offer: "Buy 3 @ ₹999",
    href: "/panties",
    image: "/images/home/cat_panties.jpg",
  },
  {
    name: "Nightwear",
    offer: "Flat 40% Off",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
  },
  {
    name: "Shapewear",
    offer: "Up to 60% Off",
    href: "/shapewear",
    image: "/images/home/cat_shapewear.jpg",
  },
  {
    name: "Activewear",
    offer: "Min 30% Off",
    href: "/activewear",
    image: "/images/home/cat_activewear.jpg",
  },
  {
    name: "Lingerie Sets",
    offer: "Exclusive Pairs",
    href: "/lingerie-sets",
    image: "/images/home/cat_bras.jpg",
  },
];

export function CategoryTiles() {
  return (
    <section className="border-b border-[var(--border)] bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="mb-1 block text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
              QUICK SHOP
            </span>
            <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-2xl">
              Shop By Category
            </h2>
          </div>
          <Link
            href="/bras"
            className="hidden items-center gap-1 text-xs font-bold tracking-wider text-[var(--accent)] uppercase transition-colors hover:text-[var(--accent-dark)] sm:inline-flex"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Scrollable grid container */}
        <div className="no-scrollbar flex items-center gap-4 overflow-x-auto scroll-smooth pt-1 pb-4 sm:gap-8">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex w-28 flex-shrink-0 transform flex-col items-center text-center transition-transform hover:-translate-y-1 sm:w-36"
            >
              {/* Circular Avatar Container with Gradient Border Ring */}
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-tr from-[var(--accent)] via-pink-400 to-amber-300 p-1 shadow-sm transition-all group-hover:shadow-lg sm:h-32 sm:w-32">
                <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-white">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
              </div>

              {/* Title & Badge */}
              <h3 className="mt-3 text-xs font-bold text-gray-900 transition-colors group-hover:text-[var(--accent)] sm:text-sm">
                {cat.name}
              </h3>
              <span className="mt-1 rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--accent-dark)] uppercase sm:text-[11px]">
                {cat.offer}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
