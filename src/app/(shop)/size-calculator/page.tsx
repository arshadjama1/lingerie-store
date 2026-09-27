import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { ArrowRight, CheckCircle2, Ruler, Sparkles } from "lucide-react";

import { FitTroubleshooter } from "@/components/size-calculator/FitTroubleshooter";
import { HowToMeasureGuide } from "@/components/size-calculator/HowToMeasureGuide";
import { SizeCalculatorWizard } from "@/components/size-calculator/SizeCalculatorWizard";

export const metadata: Metadata = {
  title: "Bra Size Calculator & FitCode™ | Surekh Intimates",
  description:
    "Find your precise bra size, sister sizes, and style recommendations in seconds with Surekh's FitCode™ Bra Size Calculator.",
};

export default function SizeCalculatorPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Hero Strip */}
      <section className="border-b border-pink-100 bg-gradient-to-b from-[#240819] via-[#1a0512] to-[#11040b] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-none border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-pink-300 uppercase">
            <Sparkles className="h-3 w-3 text-pink-400" />
            FitCode™ Precision Sizing
          </div>

          <h1 className="mt-4 font-serif text-3xl font-black tracking-tight text-white sm:text-5xl">
            Find Your Flawless Fit in 30 Seconds
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed font-normal text-pink-100/90 sm:text-sm">
            Over 80% of women wear an incorrect bra size, leading to back
            strain, slipping straps, and cup spillage. Calculate your exact
            underbust band, cup letter, and Surekh alpha size with zero
            guesswork.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-pink-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              Snug-Ribcage Formula
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              Sister Sizes Included
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              Style Recommendations
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Container */}
      <main className="mx-auto -mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="border border-pink-200 bg-white p-6 shadow-xl sm:p-10">
          <SizeCalculatorWizard />
        </div>

        {/* Section 2: Visual How-To-Measure Guide */}
        <section className="mt-14 space-y-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-[var(--accent)] uppercase">
              <Ruler className="h-4 w-4" />
              Step-by-Step Instructions
            </div>
            <h2 className="mt-1 font-serif text-2xl font-black text-gray-900">
              How to Measure Yourself Accurately
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              A standard soft measuring tape is all you need. Follow these two
              simple steps for millimeter accuracy.
            </p>
          </div>

          <HowToMeasureGuide />
        </section>

        {/* Section 3: Fit Troubleshooter Accordion */}
        <section className="mt-14">
          <FitTroubleshooter />
        </section>

        {/* Section 4: Why Surekh Intimates CTA */}
        <section className="mt-14 border border-pink-200 bg-gradient-to-r from-pink-50 via-white to-pink-50 p-8 sm:p-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                100% Comfort Guarantee
              </span>
              <h3 className="font-serif text-2xl font-black text-gray-900">
                Ready to Experience Cloud-Soft Comfort?
              </h3>
              <p className="max-w-xl text-xs text-gray-600">
                Discover our organic bamboo wireless bras and luxe bralettes
                engineered for day-long freedom and seamless silhouette.
              </p>
            </div>

            <Link
              href="/bras"
              className="flex shrink-0 items-center gap-2 bg-[var(--accent)] px-8 py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition hover:bg-pink-600"
            >
              Shop All Bras <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
