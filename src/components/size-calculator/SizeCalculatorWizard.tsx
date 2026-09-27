"use client";

import React, { useMemo, useState } from "react";

import { useFitStore } from "@/stores/useFitStore";
import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";

import {
  calculateBraSize,
  convertCmToIn,
  convertInToCm,
} from "@/lib/sizing/calculator";
import type { FitCalculationResult, Unit } from "@/lib/sizing/types";
import { cn } from "@/lib/utils";

import { HowToMeasureGuide } from "./HowToMeasureGuide";
import { SizeResultCard } from "./SizeResultCard";

interface SizeCalculatorWizardProps {
  onApplySize?: (size: string) => void;
  isModalMode?: boolean;
}

type WizardStep = "measure" | "result";

export function SizeCalculatorWizard({
  onApplySize,
  isModalMode = false,
}: SizeCalculatorWizardProps) {
  const { result: savedResult, setFitResult } = useFitStore();

  const [unit, setUnit] = useState<Unit>("in");
  const [underbust, setUnderbust] = useState<number>(30);
  const [bust, setBust] = useState<number>(34);

  const [currentStep, setCurrentStep] = useState<WizardStep>(
    savedResult ? "result" : "measure"
  );
  const [result, setResult] = useState<FitCalculationResult | null>(
    savedResult
  );
  const [showMeasureGuide, setShowMeasureGuide] = useState<boolean>(false);

  // Bounds based on unit
  const minUnderbust = unit === "in" ? 26 : 65;
  const maxUnderbust = unit === "in" ? 44 : 112;
  const minBust = unit === "in" ? 28 : 70;
  const maxBust = unit === "in" ? 54 : 138;

  // Toggle unit and convert current values
  const handleUnitToggle = (nextUnit: Unit) => {
    if (nextUnit === unit) return;
    if (nextUnit === "cm") {
      setUnderbust(Math.round(convertInToCm(underbust)));
      setBust(Math.round(convertInToCm(bust)));
    } else {
      setUnderbust(Math.round(convertCmToIn(underbust)));
      setBust(Math.round(convertCmToIn(bust)));
    }
    setUnit(nextUnit);
  };

  // Instant real-time preview computation
  const livePreview = useMemo(() => {
    try {
      return calculateBraSize(underbust, bust, unit);
    } catch {
      return null;
    }
  }, [underbust, bust, unit]);

  // Handle finalize calculation
  const handleCalculate = () => {
    const calculated = calculateBraSize(underbust, bust, unit);
    setResult(calculated);
    setFitResult(calculated, {
      underbust,
      bust,
      unit,
    });
    setCurrentStep("result");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Unit Switch & Help Link */}
      {currentStep !== "result" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <button
            type="button"
            onClick={() => setShowMeasureGuide((prev) => !prev)}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {showMeasureGuide
              ? "Hide Measuring Guide"
              : "Need help measuring? View Guide"}
          </button>

          {/* Unit Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase">
              Units:
            </span>
            <div className="inline-flex rounded-none border border-gray-200 bg-gray-50 p-0.5">
              <button
                type="button"
                onClick={() => handleUnitToggle("in")}
                className={cn(
                  "cursor-pointer px-3 py-1 text-xs font-bold transition",
                  unit === "in"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-gray-600 hover:text-black"
                )}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle("cm")}
                className={cn(
                  "cursor-pointer px-3 py-1 text-xs font-bold transition",
                  unit === "cm"
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-gray-600 hover:text-black"
                )}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditionally rendered How To Measure Guide */}
      {showMeasureGuide && currentStep !== "result" && (
        <div className="rounded-none border border-pink-200 bg-pink-50/20 p-4">
          <HowToMeasureGuide />
        </div>
      )}

      {/* Measurement Input Step */}
      {currentStep === "measure" && (
        <div className="space-y-8">
          {/* Underbust Slider / Input */}
          <div className="rounded-none border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  Step 1
                </span>
                <h4 className="font-serif text-base font-bold text-gray-900">
                  Underbust (Band Measurement)
                </h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  Measure snug against your ribcage right beneath the bust.
                </p>
              </div>

              {/* Number display */}
              <div className="flex items-baseline gap-1 rounded-none border border-gray-200 bg-gray-50 px-3 py-1.5">
                <input
                  type="number"
                  min={minUnderbust}
                  max={maxUnderbust}
                  step={unit === "in" ? 0.5 : 1}
                  value={underbust}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setUnderbust(val);
                  }}
                  className="w-14 text-center font-serif text-xl font-black text-gray-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-gray-500">{unit}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <input
                type="range"
                min={minUnderbust}
                max={maxUnderbust}
                step={unit === "in" ? 0.5 : 1}
                value={underbust}
                onChange={(e) => setUnderbust(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none bg-gray-200 accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>
                  {minUnderbust} {unit}
                </span>
                <span>
                  {maxUnderbust} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Overbust Slider / Input */}
          <div className="rounded-none border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Step 2
                </span>
                <h4 className="font-serif text-base font-bold text-gray-900">
                  Bust (Fullest Part / Cup)
                </h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  Measure gently around the fullest apex of your bust without
                  squeezing.
                </p>
              </div>

              {/* Number display */}
              <div className="flex items-baseline gap-1 rounded-none border border-gray-200 bg-gray-50 px-3 py-1.5">
                <input
                  type="number"
                  min={minBust}
                  max={maxBust}
                  step={unit === "in" ? 0.5 : 1}
                  value={bust}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setBust(val);
                  }}
                  className="w-14 text-center font-serif text-xl font-black text-gray-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-gray-500">{unit}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <input
                type="range"
                min={minBust}
                max={maxBust}
                step={unit === "in" ? 0.5 : 1}
                value={bust}
                onChange={(e) => setBust(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none bg-gray-200 accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>
                  {minBust} {unit}
                </span>
                <span>
                  {maxBust} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Bar & Action Button */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-none border border-pink-100 bg-pink-50/40 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Estimated FitCode™
                </span>
                <div className="font-serif text-sm font-black text-gray-900">
                  {livePreview ? (
                    <>
                      {livePreview.fullSize}{" "}
                      <span className="text-[var(--accent)]">
                        (Surekh {livePreview.alphaSize})
                      </span>
                    </>
                  ) : (
                    "Calculating..."
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculate}
              className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[var(--accent)] px-8 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition hover:bg-pink-600 sm:w-auto"
            >
              Calculate Size <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {currentStep === "result" && result && (
        <SizeResultCard
          result={result}
          onRecalculate={() => setCurrentStep("measure")}
          onApplySize={onApplySize}
          isModalMode={isModalMode}
        />
      )}
    </div>
  );
}
