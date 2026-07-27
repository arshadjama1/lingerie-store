import Image from "next/image";
import Link from "next/link";

import { STYLE_CUTOUTS_DATA } from "./data/homeData";

export function StyleCutoutsGrid() {
  return (
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
          {STYLE_CUTOUTS_DATA.map((tile) => (
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
  );
}
