import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Leaf,
  Percent,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { getCatalogFeatured } from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProductGrid } from "@/components/product/product-grid";
import { SaleOffersClient } from "@/components/sale/SaleOffersClient";

export const metadata: Metadata = {
  title: "Sale & Special Combos | Surekh",
  description:
    "Shop exclusive bundle deals, tiered discount offers, and first-time buyer savings on Surekh's premium breathable bamboo & modal innerwear.",
  openGraph: {
    title: "Sale & Special Offers | Surekh",
    description:
      "Exclusive combos, threshold free shipping, and tiered promo codes. Shop more, save more at Surekh.",
    type: "website",
  },
};

export const revalidate = 300;

export default async function SalePage() {
  const featuredProducts = await getCatalogFeatured(8).catch(() => []);

  return (
    <div className="bg-white">
      {/* ── Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] bg-[#fff5f8]/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Sale & Offers" }]}
          />
        </div>
      </div>

      {/* ── Hero Sale Banner ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#240819] via-[#3d0a20] to-[#5c1032] py-14 text-white sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-rose-500/15 blur-2xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-white/10 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <Flame className="h-4 w-4 text-[var(--accent-coral)]" />
            <span className="text-xs font-black tracking-widest text-pink-200 uppercase">
              Exclusive Bundles & Sitewide Offers
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Feel the Comfort. Love the Savings.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed font-light text-pink-100 sm:text-base">
            Discover curated bundle savings, special combo deals, tiered
            discounts, and exclusive coupons on India&apos;s softest breathable
            innerwear.
          </p>

          {/* Quick Perks Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-pink-200 sm:gap-8">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              100% Breathable Bamboo & Modal
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-sky-400" />
              Free Shipping on Orders ₹1,299+
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-pink-400" />
              15-Day Fit & Exchange Assurance
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Offers Container ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* ── SECTION A: TOP COMBOS & MULTIPACK DEALS (Offers 1 & 2) ─── */}
        <section className="mb-14 space-y-8">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black tracking-widest text-[var(--accent)] uppercase">
              Curated Value Combos
            </span>
            <h2 className="mt-1 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
              Signature Bundle Specials
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Specially bundled pairs and value packs engineered for maximum
              daily comfort and immediate savings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* ── 1. BAMBOO ECO-COMFORT COMBO ─────────────────────────── */}
            <div className="group hover:shadow-floating relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-[var(--accent)] sm:p-8">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                  <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                  Eco-Comfort Pair
                </span>
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-black text-white shadow-xs">
                  SAVE EXTRA ₹99
                </span>
              </div>

              {/* Combo Title & Price */}
              <div className="mt-4">
                <h3 className="font-serif text-xl font-black text-[var(--accent-plum)] sm:text-2xl">
                  Bamboo Eco-Comfort Combo
                </h3>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  Buy Bamboo Fabric Bra (₹499) + Bamboo Undie Pack of 2 (₹699)
                  together for just{" "}
                  <strong className="text-gray-900">₹1,099</strong>.
                </p>
              </div>

              {/* Product Visual Pair */}
              <div className="my-6 grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface)] p-3.5">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src="/images/products/bamboo-bra-black.png"
                    alt="Bamboo Fabric Bra"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
                    Bra · ₹499
                  </span>
                </div>

                <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src="/images/products/bamboo-undie-black.png"
                    alt="Bamboo Undie Pack"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
                    Pack of 2 · ₹699
                  </span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
                      ₹1,099
                    </span>
                    <span className="text-sm font-medium text-gray-400 line-through">
                      ₹1,198
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Instant extra ₹99 bundle discount
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/p/bamboo-fabric-bra"
                    className="rounded-none bg-[var(--accent)] px-4 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-dark)]"
                  >
                    View Combo
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 2. EVERYDAY ESSENTIALS PACK ─────────────────────────── */}
            <div className="group hover:shadow-floating relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-[var(--accent)] sm:p-8">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1 text-[11px] font-bold text-[var(--accent-dark)]">
                  <Percent className="h-3.5 w-3.5 text-[var(--accent)]" />
                  Multipack Special
                </span>
                <span className="rounded-full bg-[var(--accent-plum)] px-3 py-1 text-xs font-black text-white shadow-xs">
                  FLAT 10% OFF
                </span>
              </div>

              {/* Title & Description */}
              <div className="mt-4">
                <h3 className="font-serif text-xl font-black text-[var(--accent-plum)] sm:text-2xl">
                  Everyday Essentials Pack
                </h3>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  Buy any 2 Panty Multipacks and get an automatic{" "}
                  <strong className="text-gray-900">10% OFF at checkout</strong>
                  .
                </p>
              </div>

              {/* Product Visual Pair */}
              <div className="my-6 grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface)] p-3.5">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src="/images/products/seamless-undie-pack.png"
                    alt="Seamless Undie Pack of 3"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
                    Seamless 3-Pack
                  </span>
                </div>

                <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src="/images/products/floral-undie-navy.png"
                    alt="Floral Undie Pack of 3"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
                    Floral 3-Pack
                  </span>
                </div>
              </div>

              {/* Callout & Button */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-xs font-bold text-gray-900">
                    Mix & Match Any 2 Packs
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Auto-applied in cart & checkout
                  </span>
                </div>

                <Link
                  href="/panties"
                  className="inline-flex items-center gap-1.5 rounded-none bg-[var(--accent)] px-4 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-dark)]"
                >
                  Shop Multipacks <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION B: INTERACTIVE COUPONS & OFFERS (Offers 3, 4, 5) ─── */}
        <SaleOffersClient />

        {/* ── SECTION C: FEATURED SALE PRODUCTS ───────────────────────── */}
        {featuredProducts.length > 0 && (
          <section className="mt-16 border-t border-gray-100 pt-14">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <span className="text-xs font-black tracking-widest text-[var(--accent)] uppercase">
                  Qualifying Bestsellers
                </span>
                <h2 className="mt-1 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
                  Popular Styles to Apply Your Coupons On
                </h2>
              </div>

              <Link
                href="/bras"
                className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-[var(--accent)] uppercase transition-colors hover:text-[var(--accent-dark)]"
              >
                <span>Browse All Products</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ProductGrid products={featuredProducts} priorityCount={4} />
          </section>
        )}
      </div>
    </div>
  );
}
