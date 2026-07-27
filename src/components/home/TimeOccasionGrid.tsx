import Image from "next/image";
import Link from "next/link";

import { TIME_OCCASIONS_DATA } from "./data/homeData";

export function TimeOccasionGrid() {
  return (
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
        {TIME_OCCASIONS_DATA.map((card) => (
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
  );
}
