"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArrowRight, Flame, Heart } from "lucide-react";

import { formatPrice } from "@/lib/utils";

// ── Clovia Playful 2x2 Category Cards ──────────────────────────────────
const CLOVIA_PLAYFUL_GRID = [
  {
    title: "Top & Pjs",
    subtitle: "Comfy Lounge Sets",
    bgGradient: "from-pink-400 via-rose-300 to-pink-200",
    href: "/nightwear",
    image: "/images/home/hero_slide_2.jpg",
    badge: "3 FOR 1099",
  },
  {
    title: "Activewear",
    subtitle: "High-Impact Fitness",
    bgGradient: "from-sky-400 via-cyan-300 to-blue-200",
    href: "/activewear",
    image: "/images/home/hero_slide_3.jpg",
    badge: "MIN 30% OFF",
  },
  {
    title: "Budget Buys",
    subtitle: "Under ₹499 Essentials",
    bgGradient: "from-indigo-300 via-purple-200 to-pink-100",
    href: "/sale",
    image: "/images/home/cat_bras.jpg",
    badge: "UNDER ₹499",
  },
  {
    title: "Panty Packs",
    subtitle: "Value Combos & Packs",
    bgGradient: "from-amber-200 via-orange-200 to-pink-200",
    href: "/panties",
    image: "/images/home/cat_panties.jpg",
    badge: "4 @ ₹599",
  },
];

// ── Clovia Slanted Ribbon Cards ───────────────────────────────────────
const CLOVIA_RIBBON_CARDS = [
  {
    ribbon: "NO BRA BRA",
    subtext: "Feel Weightless & Wireless",
    tagColor: "bg-[var(--accent)] text-white shadow-md",
    href: "/bras",
    image: "/images/home/clovia_slanted_1.jpg",
  },
  {
    ribbon: "GYM READY",
    subtext: "High Impact & Bounce Control",
    tagColor: "bg-cyan-600 text-white shadow-md",
    href: "/activewear",
    image: "/images/home/hero_slide_3.jpg",
  },
  {
    ribbon: "PARTY IN SECRET",
    subtext: "Backless, Strapless & Multiway",
    tagColor: "bg-purple-600 text-white shadow-md",
    href: "/bras",
    image: "/images/home/promo_banner_1.jpg",
  },
];

// ── Clovia Time of Day Occasion Cards ─────────────────────────────────
const CLOVIA_TIME_CARDS = [
  {
    ribbon: "LAZY MORNINGS",
    title: "Soft Cotton Tees & Tops",
    tagColor: "bg-pink-500",
    href: "/nightwear",
    image: "/images/home/promo_banner_2.jpg",
  },
  {
    ribbon: "LAZY AFTERNOONS",
    title: "Breezy Shorts & Pyjamas",
    tagColor: "bg-amber-500",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
  },
  {
    ribbon: "ALL DAY LONG",
    title: "Breathable Daily Essentials",
    tagColor: "bg-emerald-500",
    href: "/bras",
    image: "/images/home/hero_slide_1.jpg",
  },
];

// ── Clovia Floral Frame Categories ────────────────────────────────────
const CLOVIA_FLORAL_GRID = [
  {
    name: "Cotton Bras",
    offer: "Soft & Breathable",
    href: "/bras",
    image: "/images/home/cat_bras.jpg",
    color: "border-pink-300/80 bg-pink-50/60",
  },
  {
    name: "Cotton Panties",
    offer: "Everyday Comfort",
    href: "/panties",
    image: "/images/home/cat_panties.jpg",
    color: "border-amber-300/80 bg-amber-50/60",
  },
  {
    name: "Camisoles",
    offer: "Layering Tops",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
    color: "border-purple-300/80 bg-purple-50/60",
  },
  {
    name: "Boyshorts",
    offer: "Anti-Chafing Fit",
    href: "/panties",
    image: "/images/home/cat_shapewear.jpg",
    color: "border-rose-300/80 bg-rose-50/60",
  },
];

// ── Clovia Sunburst Cutout Categories ────────────────────────────────
const CLOVIA_SUNBURST_TILES = [
  {
    name: "Push-Up Bra",
    href: "/bras",
    image: "/images/home/cat_bras.jpg",
    bg: "bg-pink-50 border-pink-200",
  },
  {
    name: "Bralette",
    href: "/bras",
    image: "/images/home/cat_nightwear.jpg",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    name: "Strapless Bra",
    href: "/bras",
    image: "/images/home/clovia_slanted_1.jpg",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    name: "Pyjama Sets",
    href: "/nightwear",
    image: "/images/home/hero_slide_2.jpg",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    name: "Shorts Sets",
    href: "/nightwear",
    image: "/images/home/cat_activewear.jpg",
    bg: "bg-cyan-50 border-cyan-200",
  },
  {
    name: "Nighties",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
    bg: "bg-emerald-50 border-emerald-200",
  },
];

// ── Zivame Horizontal Feature Sliders ─────────────────────────────────
const ZIVAME_FEATURE_CARDS = [
  {
    title: "T-SHIRT BRAS",
    discount: "MIN 40% OFF",
    image: "/images/home/hero_slide_1.jpg",
    href: "/bras",
  },
  {
    title: "NON-PADDED",
    discount: "MIN 40% OFF",
    image: "/images/home/promo_banner_2.jpg",
    href: "/bras",
  },
  {
    title: "PUSH-UP BRAS",
    discount: "MIN 40% OFF",
    image: "/images/home/clovia_slanted_1.jpg",
    href: "/bras",
  },
  {
    title: "SPORTS BRAS",
    discount: "MIN 30% OFF",
    image: "/images/home/hero_slide_3.jpg",
    href: "/activewear",
  },
];

// ── Tabbed Product Categories ─────────────────────────────────────────
const PRODUCT_TABS = [
  "ALL BESTSELLERS",
  "BRAS",
  "PANTIES",
  "NIGHTWEAR",
  "ACTIVEWEAR",
];

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brandName?: string | null;
  minPrice: string;
  minMrp?: string | null;
  primaryImage?: { url: string; alt?: string | null } | null;
}

export function CloviaZivameFusion({ products }: { products: ProductItem[] }) {
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
    <div className="space-y-16">
      {/* ── 1. Clovia Playful 2x2 Graphic Grid ──────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-xs font-black tracking-wider text-[var(--accent)] uppercase shadow-xs">
            <Flame className="h-3.5 w-3.5" />
            POPULAR CATEGORIES
          </span>
          <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-4xl">
            Rainy Day Vibes & Super Buys
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {CLOVIA_PLAYFUL_GRID.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative overflow-hidden rounded-none bg-gradient-to-br ${card.bgGradient} shadow-floating hover:shadow-floating-lg flex min-h-[270px] flex-col justify-between border border-white/70 p-5 transition-all hover:-translate-y-1.5 sm:min-h-[310px]`}
            >
              {/* Badge */}
              <div className="z-10 flex items-start justify-between">
                <span className="rounded-none bg-white/95 px-3 py-1 text-[10px] font-black tracking-wider text-[var(--accent-plum)] uppercase shadow-sm backdrop-blur-xs">
                  {card.badge}
                </span>
              </div>

              {/* Center Image */}
              <div className="relative mx-auto my-2 h-32 w-32 overflow-hidden rounded-none border-2 border-white/90 shadow-xl transition-transform duration-500 group-hover:scale-108 sm:h-40 sm:w-40">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Bottom text */}
              <div className="z-10 pt-1 text-center">
                <h3 className="font-serif text-base leading-tight font-black text-gray-900 sm:text-xl">
                  {card.title}
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-gray-700">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 2. Clovia Slanted Ribbon Cards ──────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
              Curated Style Moments
            </h2>
            <p className="mt-0.5 text-xs font-light text-gray-500 sm:text-sm">
              Slanted ribbon edits designed for your active & secret party moods
            </p>
          </div>
          <Link
            href="/bras"
            className="text-xs font-black tracking-wider text-[var(--accent)] uppercase hover:underline"
          >
            Explore All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CLOVIA_RIBBON_CARDS.map((card) => (
            <Link
              key={card.ribbon}
              href={card.href}
              className="group shadow-floating hover:shadow-floating-lg relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 bg-gray-900 p-7 text-white transition-all"
            >
              <Image
                src={card.image}
                alt={card.ribbon}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Clovia Slanted Ribbon Tag */}
              <div className="absolute top-6 left-0 z-10">
                <span
                  className={`inline-block ${card.tagColor} -rotate-3 px-5 py-2 text-xs font-black tracking-wider uppercase shadow-lg sm:text-sm`}
                >
                  {card.ribbon}
                </span>
              </div>

              {/* Text */}
              <div className="relative z-10 space-y-1">
                <p className="text-xs font-medium text-pink-200">
                  {card.subtext}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-md transition-all group-hover:bg-[var(--accent)] group-hover:text-white">
                    Shop Style <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Zivame Horizontal Foliage Feature Banner Carousel ────── */}
      <section className="shadow-floating-lg mx-auto max-w-7xl rounded-none bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="mb-2 inline-block rounded-none border border-emerald-400/30 bg-emerald-500/30 px-3.5 py-1 text-xs font-bold tracking-wider text-emerald-200 uppercase">
                🌿 NATURE & COMFORT EDIT
              </span>
              <h2 className="font-serif text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                Breathable Comfort Essentials
              </h2>
            </div>
            <Link
              href="/bras"
              className="flex items-center gap-1 text-xs font-bold tracking-wider text-emerald-300 uppercase hover:text-white"
            >
              View Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ZIVAME_FEATURE_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative flex flex-col items-center overflow-hidden rounded-none border border-white/15 bg-white/10 p-3 text-center shadow-md backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/20"
              >
                <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-none">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-none bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                    {card.discount}
                  </span>
                </div>
                <h3 className="mb-1 text-xs font-black tracking-wider text-white uppercase sm:text-sm">
                  {card.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Clovia Time of Day Occasion Cards ────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
            Designed for Every Hour of Your Day
          </h2>
          <p className="mt-1 text-xs font-light text-gray-500 sm:text-sm">
            From morning lounge to midnight sleepwear
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CLOVIA_TIME_CARDS.map((card) => (
            <Link
              key={card.ribbon}
              href={card.href}
              className="group shadow-floating hover:shadow-floating-lg relative flex flex-col overflow-hidden rounded-none border border-gray-100 bg-white p-4 transition-all"
            >
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-none bg-gray-100">
                <Image
                  src={card.image}
                  alt={card.ribbon}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute top-3 left-3 ${card.tagColor} rounded-none px-3.5 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-sm`}
                >
                  {card.ribbon}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-[var(--accent)]">
                {card.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[var(--accent)]">
                Shop Collection →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Clovia Floral Frame Categories ───────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="mb-2 inline-block rounded-none bg-pink-100 px-3.5 py-1 text-xs font-black tracking-wider text-[var(--accent)] uppercase shadow-xs">
            🌸 FLORAL ESSENTIALLY YOU
          </span>
          <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
            Everyday Fabric Favorites
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {CLOVIA_FLORAL_GRID.map((card) => (
            <Link
              key={card.name}
              href={card.href}
              className={`group flex flex-col items-center rounded-none border-2 p-5 text-center ${card.color} hover:shadow-floating transition-all hover:-translate-y-1.5`}
            >
              <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-36 sm:w-36">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-[var(--accent)]">
                {card.name}
              </h3>
              <span className="mt-0.5 text-[11px] font-bold text-[var(--accent)]">
                {card.offer}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 6. Clovia Sunburst Cutout Cards ─────────────────────────── */}
      <section className="mx-auto max-w-7xl rounded-none border border-pink-100 bg-gradient-to-b from-[var(--surface)] to-white py-14">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
              Explore By Style Cutouts
            </h2>
            <p className="mt-1 text-xs font-light text-gray-500 sm:text-sm">
              Find your signature lingerie silhouette
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CLOVIA_SUNBURST_TILES.map((tile) => (
              <Link
                key={tile.name}
                href={tile.href}
                className={`group flex flex-col items-center rounded-none border p-3.5 text-center ${tile.bg} transition-all hover:scale-105 hover:shadow-md`}
              >
                <div className="relative mb-2 h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm sm:h-24 sm:w-24">
                  <Image
                    src={tile.image}
                    alt={tile.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[var(--accent)]">
                  {tile.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Zivame Tabbed Product Showcase Grid ──────────────────── */}
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
            {PRODUCT_TABS.map((tab) => (
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
    </div>
  );
}
