"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowRight, Check, Copy, Gift, Tag, Truck, Zap } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface TierDiscount {
  id: string;
  spend: string;
  minSpendValue: number;
  discount: string;
  code: string;
  badge: string;
  popular?: boolean;
}

const TIER_DISCOUNTS: TierDiscount[] = [
  {
    id: "tier-1",
    spend: "₹1,199",
    minSpendValue: 1199,
    discount: "₹150 OFF",
    code: "SUREKH150",
    badge: "SAVER TIER",
  },
  {
    id: "tier-2",
    spend: "₹1,999",
    minSpendValue: 1999,
    discount: "₹250 OFF",
    code: "SUREKH250",
    badge: "MOST POPULAR",
    popular: true,
  },
  {
    id: "tier-3",
    spend: "₹2,999",
    minSpendValue: 2999,
    discount: "₹400 OFF",
    code: "SUREKH400",
    badge: "MAX SAVINGS",
  },
];

export function SaleOffersClient() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code ${code} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {
      toast.error("Failed to copy code. Please type it manually.");
    }
  };

  return (
    <div className="space-y-12">
      {/* ── 3. THRESHOLD OFFER (AOV Booster) ─────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-dashed border-pink-400 bg-gradient-to-r from-[#3d0a20] via-[#5c1032] to-[#7b1842] p-6 text-white shadow-xl sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-pink-500/20 blur-2xl"
        />

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-pink-200 uppercase backdrop-blur-sm">
              <Truck className="h-3.5 w-3.5 text-pink-300" />
              <span>Free Shipping + Extra 10% OFF</span>
            </div>

            <h2 className="font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">
              Add items worth ₹1,299+ to get FREE Shipping + Extra 10% OFF
            </h2>

            <p className="max-w-xl text-xs font-normal text-pink-100 sm:text-sm">
              Unlock automatic complimentary express courier delivery nationwide
              plus an extra 10% off on your entire shopping bag.
            </p>
          </div>

          {/* Coupon Voucher Card */}
          <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:w-auto md:items-end">
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-md">
              <Tag className="h-4 w-4 text-pink-300" />
              <div>
                <p className="text-[10px] font-bold text-pink-200 uppercase">
                  Use Promo Code
                </p>
                <p className="font-mono text-base font-black tracking-widest text-white sm:text-lg">
                  COMFORT10
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard("COMFORT10")}
                className="ml-3 flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-bold text-[var(--accent-plum)] shadow-sm transition-all hover:bg-pink-100 active:scale-95"
              >
                {copiedCode === "COMFORT10" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <Link
              href="/bras"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-200 underline hover:text-white"
            >
              <span>Explore qualifying styles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FIRST-TIME BUYER INCENTIVE ───────────────────────────── */}
      <section className="rounded-2xl border border-pink-200/80 bg-gradient-to-br from-[#fff5f8] via-white to-pink-50/60 p-6 shadow-xs sm:p-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-md">
              <Gift className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <span className="inline-block text-[11px] font-black tracking-widest text-[var(--accent)] uppercase">
                Welcome Privilege
              </span>
              <h3 className="font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
                Join the Surekh Family
              </h3>
              <p className="text-sm font-medium text-gray-700">
                Flat{" "}
                <strong className="text-[var(--accent-plum)]">₹100 OFF</strong>{" "}
                on your first order above ₹799 using code{" "}
                <span className="font-mono font-bold text-[var(--accent)]">
                  FIRST100
                </span>
                .
              </p>
              <p className="text-xs text-gray-500">
                Valid on all collections: Bras, Panties, Sets, and Loungewear.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-dashed border-pink-300 bg-white px-4 py-2.5 text-center shadow-2xs">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">
                Coupon Code
              </span>
              <span className="font-mono text-base font-black tracking-wider text-[var(--accent-plum)]">
                FIRST100
              </span>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard("FIRST100")}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-none bg-[var(--accent)] px-5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[var(--accent-dark)]"
            >
              {copiedCode === "FIRST100" ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. SPEND MORE, SAVE MORE (Tiered Discounts) ──────────────── */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[var(--accent)] uppercase">
            <Zap className="h-3.5 w-3.5" />
            <span>Tiered Savings</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
            Spend More, Save More
          </h2>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            The bigger your bag, the higher your instant discount. Copy your
            code and apply at checkout!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TIER_DISCOUNTS.map((tier) => {
            const isCopied = copiedCode === tier.code;
            return (
              <div
                key={tier.id}
                className={cn(
                  "hover:shadow-floating relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1",
                  tier.popular
                    ? "border-[var(--accent)] bg-gradient-to-b from-[#fff5f8] via-white to-pink-50/50 shadow-md ring-1 ring-[var(--accent)]"
                    : "border-gray-200 bg-white shadow-2xs"
                )}
              >
                {/* Popular Ribbon */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                      Spend {tier.spend}
                    </span>
                    <span className="rounded-md bg-pink-100/70 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-dark)]">
                      Instant Voucher
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="font-serif text-3xl font-black text-[var(--accent-plum)]">
                      {tier.discount}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      When your bag total reaches {tier.spend} or more.
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 px-3.5 py-2.5">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-500 uppercase">
                        Code
                      </span>
                      <span className="font-mono text-sm font-black text-gray-900">
                        {tier.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(tier.code)}
                      className={cn(
                        "flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all",
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                      )}
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
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
