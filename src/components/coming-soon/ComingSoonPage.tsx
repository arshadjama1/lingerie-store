import Image from "next/image";

import { Sparkles } from "lucide-react";

import { ComingSoonHeader } from "./ComingSoonHeader";
import { CountdownTimer } from "./CountdownTimer";

export function ComingSoonPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#15020c] text-white selection:bg-[#c83c7e] selection:text-white">
      {/* ── Background Ambience & Lighting ─────────────────────────── */}
      {/* Editorial Model Background with Dark Vignette */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/home/hero_slide_1.jpg"
          alt="Surekh Luxury Intimates Preview"
          fill
          priority
          className="object-cover object-top opacity-20 contrast-125 filter"
        />
        {/* Multilayered radial and linear dark luxury vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#15020c]/80 via-[#1e0413]/90 to-[#12010a]" />
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#d4af37]/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/4 right-0 h-[600px] w-[500px] rounded-full bg-[#c83c7e]/15 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-1/3 left-0 h-[600px] w-[600px] rounded-full bg-[#9e1f5c]/10 blur-[160px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Luxury Minimalist Header */}
        <ComingSoonHeader />

        {/* ── HERO SECTION ────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-20 lg:px-8">
          {/* Eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase shadow-[0_0_20px_rgba(212,175,55,0.15)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>THE PRIVATE UNVEILING</span>
          </div>

          {/* Seductive Headline */}
          <h1 className="max-w-4xl font-serif text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            Something Intimate{" "}
            <span className="mt-1 block bg-gradient-to-r from-rose-200 via-white to-[#d4af37] bg-clip-text font-normal text-transparent italic sm:mt-2">
              Is Arriving.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-sm leading-relaxed font-light text-rose-100/80 sm:text-base md:text-lg">
            We are perfecting an intimate collection designed to feel like a
            second skin. Pure French laces, hypoallergenic mulberry silks, and
            zero-compromise fit assurance.
          </p>

          {/* Countdown Clock */}
          <div className="mt-10 w-full sm:mt-12">
            <CountdownTimer />
          </div>
        </main>
      </div>
    </div>
  );
}
