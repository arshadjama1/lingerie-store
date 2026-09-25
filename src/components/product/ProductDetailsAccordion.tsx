"use client";

import React, { useState } from "react";

import {
  ChevronDown,
  Feather,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { ProductDescription } from "./ProductDescription";

interface ProductDetailsAccordionProps {
  description: string | null;
  fabric?: string | null;
  careInstructions?: string | null;
  attributes: Record<string, string>;
  hsnCode?: string | null;
}

export function ProductDetailsAccordion({
  description,
  fabric,
  careInstructions,
  attributes,
  hsnCode,
}: ProductDetailsAccordionProps) {
  // Open description by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    fabric: true,
    shipping: false,
    specs: false,
  });

  const toggle = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Description & Story */}
      <div className="border border-gray-200 bg-white">
        <button
          onClick={() => toggle("description")}
          className="flex w-full cursor-pointer items-center justify-between p-5 text-left font-serif text-base font-bold text-gray-900 transition hover:bg-gray-50/50 sm:text-lg"
          aria-expanded={openSections.description}
        >
          <span className="flex items-center gap-2 text-[var(--accent-plum)]">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Product Details & Key Features
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              openSections.description && "rotate-180 text-[var(--accent)]"
            )}
          />
        </button>
        {openSections.description && (
          <div className="border-t border-gray-100 bg-white p-5 sm:p-6">
            <ProductDescription description={description} />
          </div>
        )}
      </div>

      {/* 2. Fabric & Care */}
      <div className="border border-gray-200 bg-white">
        <button
          onClick={() => toggle("fabric")}
          className="flex w-full cursor-pointer items-center justify-between p-5 text-left font-serif text-base font-bold text-gray-900 transition hover:bg-gray-50/50 sm:text-lg"
          aria-expanded={openSections.fabric}
        >
          <span className="flex items-center gap-2 text-[var(--accent-plum)]">
            <Feather className="h-4 w-4 text-[var(--accent)]" />
            Fabric Composition & Care Instructions
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              openSections.fabric && "rotate-180 text-[var(--accent)]"
            )}
          />
        </button>
        {openSections.fabric && (
          <div className="space-y-4 border-t border-gray-100 bg-white p-5 text-xs text-gray-700 sm:p-6 sm:text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-none border border-pink-100/60 bg-[var(--surface)] p-4">
                <span className="mb-1 block text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Primary Material
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {fabric ||
                    attributes.fabric ||
                    "Premium Modal & Bamboo Blend with Elastane Stretch"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Ultra-soft, hypoallergenic, breathable, and naturally
                  temperature-regulating.
                </p>
              </div>

              <div className="rounded-none border border-pink-100/60 bg-[var(--surface)] p-4">
                <span className="mb-1 block text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Recommended Care
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {careInstructions ||
                    attributes.careInstructions ||
                    "Hand wash in cold water (recommended)"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Do not bleach, do not wring, do not iron. Dry flat in shade.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Discreet Packaging & Guarantee */}
      <div className="border border-gray-200 bg-white">
        <button
          onClick={() => toggle("shipping")}
          className="flex w-full cursor-pointer items-center justify-between p-5 text-left font-serif text-base font-bold text-gray-900 transition hover:bg-gray-50/50 sm:text-lg"
          aria-expanded={openSections.shipping}
        >
          <span className="flex items-center gap-2 text-[var(--accent-plum)]">
            <PackageCheck className="h-4 w-4 text-[var(--accent)]" />
            100% Discreet Packaging & Return Policy
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              openSections.shipping && "rotate-180 text-[var(--accent)]"
            )}
          />
        </button>
        {openSections.shipping && (
          <div className="space-y-3.5 border-t border-gray-100 bg-white p-5 text-xs text-gray-700 sm:p-6 sm:text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <strong className="block text-gray-900">
                  Plain, Unmarked Packaging
                </strong>
                <p className="text-xs leading-relaxed text-gray-600">
                  All orders arrive in tamper-proof, discreet boxes without any
                  product names or logos on the outer label.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <strong className="block text-gray-900">
                  15-Day Exchange & Easy Returns
                </strong>
                <p className="text-xs leading-relaxed text-gray-600">
                  Bras and sets are eligible for 15-day size exchange. For
                  hygiene reasons, panties must have intact hygiene seals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Specifications & HSN */}
      <div className="border border-gray-200 bg-white">
        <button
          onClick={() => toggle("specs")}
          className="flex w-full cursor-pointer items-center justify-between p-5 text-left font-serif text-base font-bold text-gray-900 transition hover:bg-gray-50/50 sm:text-lg"
          aria-expanded={openSections.specs}
        >
          <span className="flex items-center gap-2 text-[var(--accent-plum)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Product Specifications
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              openSections.specs && "rotate-180 text-[var(--accent)]"
            )}
          />
        </button>
        {openSections.specs && (
          <div className="border-t border-gray-100 bg-white p-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
              {Object.entries(attributes).map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-gray-100 pb-2"
                >
                  <dt className="font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </dt>
                  <dd className="text-right font-bold text-gray-900">{val}</dd>
                </div>
              ))}
              {hsnCode && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <dt className="font-medium text-gray-500">HSN Code</dt>
                  <dd className="font-mono font-bold text-gray-900">
                    {hsnCode} (All Taxes Included)
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
