import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

export function CuratedSpotlightBanners() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Banner 1 — Bamboo Range */}
        <Link
          href="/bras"
          className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
        >
          <Image
            src="/images/products/bamboo-bra-cinder.png"
            alt="Bamboo Fabric Range"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-block rounded-none bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              BAMBOO EDIT
            </span>
            <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
              Softest Bras
              <br />
              On Earth
            </h3>
            <p className="max-w-xs text-xs font-light text-gray-200">
              95% Bamboo · Wire-free · Breathable · Available in Black, Navy &
              Cinder
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-all hover:bg-[var(--accent)] hover:text-white">
              Shop Bamboo <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Banner 2 — Seamless Undie Pack */}
        <Link
          href="/panties"
          className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
        >
          <Image
            src="/images/products/seamless-undie-navy.png"
            alt="Seamless Undie Pack of 3"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-block rounded-none bg-amber-500 px-3 py-1 text-[10px] font-black tracking-widest text-black uppercase">
              BESTSELLER
            </span>
            <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
              Seamless
              <br />
              Pack of 3
            </h3>
            <p className="max-w-xs text-xs font-light text-gray-200">
              Zero panty lines. Invisible under any outfit. Pack of 3 at just
              ₹750.
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-all hover:bg-[var(--accent)] hover:text-white">
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
