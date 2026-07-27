import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { COMBO_DEALS_DATA } from "./data/homeData";

export function ComboDealsStrip() {
  return (
    <section className="bg-gradient-to-r from-[#3d0a20] via-[#5c1032] to-[#7b1842] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="font-serif text-lg font-black tracking-tight text-white uppercase sm:text-2xl">
              Shop More, Pay Less
            </h2>
            <p className="mt-0.5 text-xs font-light text-pink-200">
              Super saver bundles — maximum comfort, minimum prices!
            </p>
          </div>
          <Link
            href="/sale"
            className="flex items-center gap-1 text-xs font-bold tracking-wider text-pink-300 uppercase transition-colors hover:text-white"
          >
            All Offers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {COMBO_DEALS_DATA.map((deal) => (
            <Link
              key={deal.id}
              href={deal.href}
              className="group relative flex min-h-[175px] flex-col justify-between overflow-hidden rounded-none border border-white/20 p-5 text-center text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Background Image */}
              <Image
                src={deal.image}
                alt={deal.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Light Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${deal.color}`}
              />

              {/* Card Content */}
              <div className="relative z-10 pt-2">
                <p className="text-xs font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {deal.label}
                </p>
              </div>

              <div className="relative z-10 mt-2">
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-3xl">
                  {deal.price}
                </p>
                <p className="text-xs font-bold text-gray-200 line-through drop-shadow-sm">
                  {deal.original}
                </p>
                <span className="mt-2 inline-block rounded-none bg-white px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--accent-plum)] uppercase shadow-md">
                  {deal.saving}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
