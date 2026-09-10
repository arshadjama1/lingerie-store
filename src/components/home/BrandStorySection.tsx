import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Users } from "lucide-react";

import { BRAND_STATS_DATA } from "./data/homeData";

export function BrandStorySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-none shadow-lg">
          <Image
            src="/images/home/brand_story_banner.jpg"
            alt="Trusted by women across India"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className="inline-flex items-center gap-2 rounded-none bg-white/90 px-4 py-2 text-xs font-black tracking-wider text-[#3d0a20] uppercase shadow-lg backdrop-blur-sm">
              <Users className="h-4 w-4 text-[var(--accent)]" />
              Trusted by 50 Lac+ Women
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-black tracking-widest text-[var(--accent)] uppercase">
              Our Story
            </p>
            <h2 className="font-serif text-2xl leading-tight font-black text-[var(--accent-plum)] sm:text-3xl">
              Happy is Our Superpower
            </h2>
          </div>
          <p className="text-sm leading-relaxed font-light text-gray-600">
            Surekh combines joyful fashion ethos with fit precision. Every piece
            is designed for Indian body types, ensuring 100% skin comfort, shape
            retention, and unmatched confidence.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {BRAND_STATS_DATA.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-none border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
                >
                  <Icon className="mx-auto mb-1 h-5 w-5 text-[var(--accent)]" />
                  <p className="text-xl font-black text-[var(--accent-plum)]">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          <Link
            href="/bras"
            className="inline-flex items-center gap-2 rounded-none bg-[var(--accent)] px-7 py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-colors hover:bg-[var(--accent-dark)]"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
