"use client";

import Link from "next/link";
import React from "react";

import { useFitStore } from "@/stores/useFitStore";
import {
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Ruler,
  Sparkles,
} from "lucide-react";

export function FitProfileCard() {
  const { result, measurements, hasCalculated } = useFitStore();

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[var(--accent)]">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                My Sizing & FitCode™
              </h3>
              {hasCalculated && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Saved
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              Personalized bra and underwear sizing recommendations.
            </p>
          </div>
        </div>

        <Link
          href="/size-calculator"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
        >
          {hasCalculated ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Recalculate Fit</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Find My Size</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Link>
      </div>

      {hasCalculated && result ? (
        <div className="mt-5 border-t border-rose-50 pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Primary Size */}
            <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-pink-50/30 p-3.5 text-center">
              <p className="text-[10px] font-bold tracking-widest text-[var(--accent-plum)] uppercase">
                Recommended Bra Size
              </p>
              <p className="mt-1 font-serif text-2xl font-black text-[var(--accent)]">
                {result.fullSize}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Alpha Equivalent: {result.alphaSize}
              </p>
            </div>

            {/* Sister Sizes */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5 text-center">
              <p className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                Sister Sizes
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                {result.sisterSizes.tighterBand && (
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-neutral-800 shadow-2xs">
                    {result.sisterSizes.tighterBand.full} (Snug)
                  </span>
                )}
                {result.sisterSizes.looserBand && (
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-neutral-800 shadow-2xs">
                    {result.sisterSizes.looserBand.full} (Relaxed)
                  </span>
                )}
                {!result.sisterSizes.tighterBand &&
                  !result.sisterSizes.looserBand && (
                    <span className="text-xs text-neutral-400">None</span>
                  )}
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Alternative band fits
              </p>
            </div>

            {/* Measurements */}
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5 text-center">
              <p className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                Saved Tape Measurements
              </p>
              <p className="mt-1 text-xs font-semibold text-neutral-800">
                Underbust: {measurements?.underbust}{" "}
                {measurements?.unit === "in" ? "in" : "cm"}
              </p>
              <p className="text-xs font-semibold text-neutral-800">
                Bust: {measurements?.bust}{" "}
                {measurements?.unit === "in" ? "in" : "cm"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-rose-200 bg-rose-50/30 p-4 text-center sm:text-left">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div>
              <p className="text-xs font-bold text-neutral-800">
                You haven't saved your FitCode™ yet
              </p>
              <p className="text-[11px] text-neutral-500">
                Take our 60-second guided quiz to calculate your perfect band &
                cup sizing for zero spillage and all-day comfort.
              </p>
            </div>
            <Link
              href="/size-calculator"
              className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--accent-dark)]"
            >
              Start 60s Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
