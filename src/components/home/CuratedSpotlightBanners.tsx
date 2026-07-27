import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

export function CuratedSpotlightBanners() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Banner 1 */}
        <Link
          href="/lingerie-sets"
          className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
        >
          <Image
            src="/images/home/promo_banner_1.jpg"
            alt="Luxury Lace Edit"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-block rounded-none bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
              EXCLUSIVE EDIT
            </span>
            <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
              The Luxury
              <br />
              Lace Edit
            </h3>
            <p className="max-w-xs text-xs font-light text-gray-200">
              French-inspired lace bralettes, corsets & matching sets
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-all hover:bg-[var(--accent)] hover:text-white">
              Explore <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Banner 2 */}
        <Link
          href="/bras"
          className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
        >
          <Image
            src="/images/home/promo_banner_2.jpg"
            alt="Everyday Comfort"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-block rounded-none bg-amber-500 px-3 py-1 text-[10px] font-black tracking-widest text-black uppercase">
              BESTSELLERS
            </span>
            <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
              Cloud-Soft
              <br />
              Everyday Bras
            </h3>
            <p className="max-w-xs text-xs font-light text-gray-200">
              Wireless cotton bras engineered for 18-hour skin comfort
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
