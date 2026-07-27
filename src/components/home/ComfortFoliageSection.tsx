import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { FEATURED_COMFORT_CARDS_DATA } from "./data/homeData";

export function ComfortFoliageSection() {
  return (
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
          {FEATURED_COMFORT_CARDS_DATA.map((card) => (
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
  );
}
