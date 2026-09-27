"use client";

import Link from "next/link";
import React from "react";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import type { FitCalculationResult } from "@/lib/sizing/types";

interface SizeResultCardProps {
  result: FitCalculationResult;
  onRecalculate?: () => void;
  onApplySize?: (size: string) => void;
  isModalMode?: boolean;
}

export function SizeResultCard({
  result,
  onRecalculate,
  onApplySize,
  isModalMode = false,
}: SizeResultCardProps) {
  return (
    <div className="space-y-6">
      {/* Primary Result Banner */}
      <div className="relative overflow-hidden border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-pink-50/50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
            <Sparkles className="h-3 w-3" />
            Your FitCode™ Precision Match
          </span>

          <div className="mt-4 flex flex-col items-center sm:flex-row sm:gap-6">
            <div className="text-center">
              <span className="text-[11px] font-black tracking-wider text-gray-500 uppercase">
                Bra Size
              </span>
              <div className="font-serif text-5xl font-black tracking-tight text-gray-900 sm:text-6xl">
                {result.fullSize}
              </div>
            </div>

            <div className="my-2 hidden h-10 w-px bg-gray-200 sm:block" />

            <div className="text-center">
              <span className="text-[11px] font-black tracking-wider text-[var(--accent)] uppercase">
                Surekh Apparel Size
              </span>
              <div className="font-serif text-5xl font-black tracking-tight text-[var(--accent)] sm:text-6xl">
                {result.alphaSize}
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-md text-xs text-gray-600">
            Based on an underbust of{" "}
            <strong>{result.underbustInches}&quot;</strong> and bust of{" "}
            <strong>{result.bustInches}&quot;</strong>.
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isModalMode && onApplySize && (
              <button
                type="button"
                onClick={() => onApplySize(result.alphaSize)}
                className="flex cursor-pointer items-center gap-2 bg-gray-900 px-6 py-3 text-xs font-black tracking-wider text-white uppercase shadow-md transition hover:bg-black"
              >
                <Check className="h-4 w-4 text-[var(--accent)]" />
                Select Size {result.alphaSize}
              </button>
            )}

            <Link
              href={`/bras?size=${encodeURIComponent(result.alphaSize)}`}
              className="flex items-center gap-2 bg-[var(--accent)] px-6 py-3 text-xs font-black tracking-wider text-white uppercase shadow-md transition hover:bg-pink-600"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Size {result.alphaSize} Bras
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {onRecalculate && (
              <button
                type="button"
                onClick={onRecalculate}
                className="flex cursor-pointer items-center gap-1.5 border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Recalculate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sister Sizes Matrix */}
      <div className="border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-black tracking-wider text-gray-900 uppercase">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          Sister Sizing (Cross-Sizes)
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Sister sizes hold the exact same cup volume with a snugger or looser
          band. If your preferred size feels slightly off, try these:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.sisterSizes.tighterBand ? (
            <div className="border border-gray-200 bg-gray-50/60 p-3.5">
              <span className="text-[10px] font-black tracking-wider text-gray-500 uppercase">
                Snugger / Firm Band
              </span>
              <div className="mt-1 font-serif text-xl font-black text-gray-900">
                {result.sisterSizes.tighterBand.full}
              </div>
              <p className="mt-1 text-[11px] text-gray-600">
                Recommended if you prefer firm athletic grip or if your band
                tends to ride up in the back.
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 p-3.5 text-[11px] text-gray-400">
              No smaller sister band available.
            </div>
          )}

          {result.sisterSizes.looserBand ? (
            <div className="border border-gray-200 bg-gray-50/60 p-3.5">
              <span className="text-[10px] font-black tracking-wider text-gray-500 uppercase">
                Relaxed / Lounge Band
              </span>
              <div className="mt-1 font-serif text-xl font-black text-gray-900">
                {result.sisterSizes.looserBand.full}
              </div>
              <p className="mt-1 text-[11px] text-gray-600">
                Recommended for all-day easy lounging or if you feel ribcage
                tightness on long days.
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 p-3.5 text-[11px] text-gray-400">
              No larger sister band available.
            </div>
          )}
        </div>
      </div>

      {/* Recommended Bra Styles */}
      {result.recommendedBraStyles.length > 0 && (
        <div className="border border-gray-200 bg-white p-5">
          <div className="text-xs font-black tracking-wider text-gray-900 uppercase">
            Recommended Styles For You
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.recommendedBraStyles.map((style) => (
              <span
                key={style}
                className="inline-flex items-center gap-1.5 border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs font-semibold text-gray-800"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                {style}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fit Guarantee Tip */}
      <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <span>
          <strong>Surekh 100% Fit Guarantee:</strong> Not sure? If your new bra
          doesn&apos;t fit like a dream, exchange it free of charge within 15
          days!
        </span>
      </div>
    </div>
  );
}
