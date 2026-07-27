import Link from "next/link";

import { CheckCircle2, Sparkles } from "lucide-react";

export function FitCodeCalculatorBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-[var(--accent-plum)] via-[#7b1842] to-[var(--accent-dark)] p-8 text-white shadow-2xl sm:p-14">
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-none border border-pink-400/25 bg-pink-500/25 px-3 py-1 text-xs font-bold text-pink-200">
              <Sparkles className="h-3.5 w-3.5 text-pink-300" />
              FitCode™ Bra Size Calculator
            </div>
            <h2 className="font-serif text-2xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              80% of Women Wear
              <br />
              the Wrong Bra Size!
            </h2>
            <p className="text-sm leading-relaxed font-light text-pink-100">
              Take our 60-second interactive size quiz to uncover your true cup
              size, recommended band fit, and custom style matches tailored for
              your body shape.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-pink-200 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-pink-400" /> 100% Accurate
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-pink-400" /> Personalised
                Fit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-pink-400" /> Under 1
                Minute
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/size-guide"
              className="pulse-glow inline-flex transform items-center justify-center rounded-none bg-white px-10 py-4 text-sm font-black tracking-wider text-[var(--accent-plum)] uppercase shadow-xl transition-all hover:scale-105 hover:bg-[var(--accent)] hover:text-white"
            >
              Find My Perfect Fit →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
