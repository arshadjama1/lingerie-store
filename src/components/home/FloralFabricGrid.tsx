import Image from "next/image";
import Link from "next/link";

import { FLORAL_FABRICS_DATA } from "./data/homeData";

export function FloralFabricGrid() {
  return (
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
        {FLORAL_FABRICS_DATA.map((card) => (
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
  );
}
