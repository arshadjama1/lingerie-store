"use client";

import React, { useState } from "react";

import { Check, Copy, Tag } from "lucide-react";

interface Offer {
  code: string;
  title: string;
  desc: string;
}

const OFFERS: Offer[] = [
  {
    code: "SUREKH10",
    title: "10% Flat Off",
    desc: "Use on your first order above ₹699",
  },
  {
    code: "COMBO3",
    title: "Bundle Special",
    desc: "Extra 15% off on any 3+ items",
  },
];

export function OffersCard() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="border border-pink-200/80 bg-gradient-to-r from-pink-50/50 via-rose-50/30 to-amber-50/30 p-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Tag className="h-4 w-4 text-[var(--accent)]" />
        <span className="text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
          Exclusive Offers & Coupons
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {OFFERS.map((offer) => {
          const isCopied = copiedCode === offer.code;
          return (
            <div
              key={offer.code}
              className="flex items-center justify-between border border-dashed border-pink-300 bg-white/90 p-2.5 shadow-2xs"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black tracking-wider text-gray-900">
                    {offer.code}
                  </span>
                  <span className="py-0.2 bg-pink-100/70 px-1.5 text-[10px] font-bold text-[var(--accent)]">
                    {offer.title}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                  {offer.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(offer.code)}
                className="flex shrink-0 cursor-pointer items-center gap-1 bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-[var(--accent)] uppercase transition hover:bg-[var(--accent)] hover:text-white"
                title="Copy coupon code"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
