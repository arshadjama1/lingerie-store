"use client";

import React, { useState } from "react";

import { CheckCircle2, Ruler, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

type Unit = "in" | "cm";

interface SizeRow {
  size: string;
  bustIn: string;
  bustCm: string;
  underbustIn: string;
  underbustCm: string;
  waistIn: string;
  waistCm: string;
  hipsIn: string;
  hipsCm: string;
  cup?: string;
}

const SIZE_DATA: SizeRow[] = [
  {
    size: "XS",
    bustIn: "30 - 32",
    bustCm: "76 - 81",
    underbustIn: "26 - 28",
    underbustCm: "66 - 71",
    waistIn: "24 - 26",
    waistCm: "61 - 66",
    hipsIn: "33 - 35",
    hipsCm: "84 - 89",
    cup: "30B, 32A",
  },
  {
    size: "S",
    bustIn: "32 - 34",
    bustCm: "81 - 86",
    underbustIn: "28 - 30",
    underbustCm: "71 - 76",
    waistIn: "26 - 28",
    waistCm: "66 - 71",
    hipsIn: "35 - 37",
    hipsCm: "89 - 94",
    cup: "32B, 34A",
  },
  {
    size: "M",
    bustIn: "34 - 36",
    bustCm: "86 - 91",
    underbustIn: "30 - 32",
    underbustCm: "76 - 81",
    waistIn: "28 - 30",
    waistCm: "71 - 76",
    hipsIn: "37 - 39",
    hipsCm: "94 - 99",
    cup: "34B, 34C, 36A",
  },
  {
    size: "L",
    bustIn: "36 - 38",
    bustCm: "91 - 97",
    underbustIn: "32 - 34",
    underbustCm: "81 - 86",
    waistIn: "30 - 32",
    waistCm: "76 - 81",
    hipsIn: "39 - 41",
    hipsCm: "99 - 104",
    cup: "36B, 36C, 38A",
  },
  {
    size: "XL",
    bustIn: "38 - 41",
    bustCm: "97 - 104",
    underbustIn: "34 - 36",
    underbustCm: "86 - 91",
    waistIn: "32 - 35",
    waistCm: "81 - 89",
    hipsIn: "41 - 44",
    hipsCm: "104 - 112",
    cup: "38B, 38C, 40B",
  },
  {
    size: "XXL",
    bustIn: "41 - 44",
    bustCm: "104 - 112",
    underbustIn: "36 - 38",
    underbustCm: "91 - 97",
    waistIn: "35 - 38",
    waistCm: "89 - 97",
    hipsIn: "44 - 47",
    hipsCm: "112 - 119",
    cup: "40C, 40D, 42C",
  },
  {
    size: "3XL",
    bustIn: "44 - 47",
    bustCm: "112 - 119",
    underbustIn: "38 - 40",
    underbustCm: "97 - 102",
    waistIn: "38 - 41",
    waistCm: "97 - 104",
    hipsIn: "47 - 50",
    hipsCm: "119 - 127",
    cup: "42D, 44C",
  },
];

export function SizeGuideModal({
  isOpen,
  onClose,
  categoryName = "Apparel",
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<Unit>("in");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-none border border-pink-100 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-pink-50 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                <Sparkles className="h-3 w-3" />
                FitCode™ Precision
              </span>
              <span className="text-xs font-medium text-gray-500">
                {categoryName}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-xl font-black text-gray-900 sm:text-2xl">
              Size & Fit Measurement Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Measurements are body dimensions in{" "}
            <strong>{unit === "in" ? "Inches" : "Centimeters"}</strong>.
          </p>
          <div className="flex rounded-none border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => setUnit("in")}
              className={cn(
                "px-3 py-1 text-xs font-bold transition",
                unit === "in"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "cursor-pointer text-gray-600 hover:text-black"
              )}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={cn(
                "px-3 py-1 text-xs font-bold transition",
                unit === "cm"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "cursor-pointer text-gray-600 hover:text-black"
              )}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="mt-4 overflow-x-auto border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 font-black tracking-wider text-gray-700 uppercase">
              <tr>
                <th className="p-3">Size</th>
                <th className="p-3">Bust</th>
                <th className="p-3">Underbust</th>
                <th className="p-3">Waist</th>
                <th className="p-3">Hips</th>
                <th className="hidden p-3 sm:table-cell">Sister Cups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {SIZE_DATA.map((row) => (
                <tr key={row.size} className="transition hover:bg-pink-50/40">
                  <td className="bg-gray-50/60 p-3 font-bold text-gray-900">
                    {row.size}
                  </td>
                  <td className="p-3">
                    {unit === "in" ? row.bustIn : row.bustCm}
                  </td>
                  <td className="p-3">
                    {unit === "in" ? row.underbustIn : row.underbustCm}
                  </td>
                  <td className="p-3">
                    {unit === "in" ? row.waistIn : row.waistCm}
                  </td>
                  <td className="p-3">
                    {unit === "in" ? row.hipsIn : row.hipsCm}
                  </td>
                  <td className="hidden p-3 text-[11px] text-gray-500 sm:table-cell">
                    {row.cup}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Guidelines */}
        <div className="mt-6 space-y-3 rounded-none border border-pink-100 bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[var(--accent-plum)] uppercase">
            <Ruler className="h-4 w-4 text-[var(--accent)]" />
            How to Measure for Perfect Fit
          </div>
          <div className="grid grid-cols-1 gap-3 text-xs text-gray-600 sm:grid-cols-2">
            <div>
              <strong className="mb-0.5 block text-gray-900">
                1. Bust / Chest:
              </strong>
              Measure around the fullest part of your bust with a relaxed tape,
              keeping it parallel to the floor.
            </div>
            <div>
              <strong className="mb-0.5 block text-gray-900">
                2. Underbust / Band:
              </strong>
              Measure directly beneath your bustline where the bra band sits
              snugly.
            </div>
            <div>
              <strong className="mb-0.5 block text-gray-900">3. Waist:</strong>
              Measure around your natural waistline (narrowest part of torso),
              breathing naturally.
            </div>
            <div>
              <strong className="mb-0.5 block text-gray-900">4. Hips:</strong>
              Measure around the fullest part of your hips and rear, standing
              with feet together.
            </div>
          </div>
        </div>

        {/* Fit Guarantee Tip */}
        <div className="mt-5 flex items-center gap-2.5 border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Pre-Purchase Sizing Tip:</strong> Between two sizes? If you
            prefer a relaxed lounge feel, choose the larger size. If you need
            help finding the right size, our support team is happy to assist
            prior to purchase!
          </span>
        </div>
      </div>
    </div>
  );
}
