import Image from "next/image";
import Link from "next/link";

import { Flame } from "lucide-react";

import { PLAYFUL_CATEGORIES_DATA } from "./data/homeData";

export function PlayfulCategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-subtle)] px-4 py-1.5 text-xs font-black tracking-wider text-[var(--accent)] uppercase shadow-xs">
          <Flame className="h-3.5 w-3.5" />
          POPULAR CATEGORIES
        </span>
        <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-4xl">
          Everyday Comfort & Best Buys
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {PLAYFUL_CATEGORIES_DATA.map((card) => (
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
  );
}
