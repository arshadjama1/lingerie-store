import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { RIBBON_EDITS_DATA } from "./data/homeData";

export function RibbonEditsGrid() {
  return (
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
        {RIBBON_EDITS_DATA.map((card) => (
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

            {/* Slanted Ribbon Tag */}
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
  );
}
