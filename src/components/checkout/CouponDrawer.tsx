"use client";

import { useEffect, useState } from "react";

import type { AvailableCouponItem } from "@/app/api/coupons/available/route";
import { Check, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";

interface CouponDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => Promise<boolean>;
}

export function CouponDrawer({
  isOpen,
  onClose,
  subtotal,
  appliedCouponCode,
  onApplyCoupon,
}: CouponDrawerProps) {
  const [coupons, setCoupons] = useState<AvailableCouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCoupons() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/coupons/available");
        const data = await res.json();
        setCoupons(data.coupons || []);
      } catch (err) {
        console.error("[CouponDrawer] Error fetching coupons:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoupons();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = async (code: string) => {
    try {
      setApplyingCode(code);
      const success = await onApplyCoupon(code);
      if (success) {
        onClose();
      }
    } finally {
      setApplyingCode(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    handleApply(manualCode.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                Coupons & Offers
              </h3>
              <p className="text-xs text-neutral-500">
                Tap to apply maximum savings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Manual Input */}
        <div className="border-b border-neutral-100 p-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium uppercase placeholder:font-normal placeholder:text-neutral-400 placeholder:normal-case focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || applyingCode === manualCode}
              className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-black disabled:opacity-50"
            >
              {applyingCode === manualCode ? "Checking..." : "Apply"}
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              No promotions currently available.
            </div>
          ) : (
            coupons.map((coupon) => {
              const isApplied = appliedCouponCode === coupon.code;
              const isEligible = subtotal >= coupon.minOrderValue;
              const isBusy = applyingCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    isApplied
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)]/30 ring-1 ring-[var(--accent)]"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-dashed border-[var(--accent)] bg-[var(--accent-subtle)]/40 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-[var(--accent)]">
                          {coupon.code}
                        </span>
                        {coupon.highlight && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {coupon.highlight}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-neutral-900">
                        {coupon.name}
                      </h4>
                      <p className="text-xs text-neutral-600">
                        {coupon.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isApplied || isBusy}
                      onClick={() => handleApply(coupon.code)}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                        isApplied
                          ? "bg-emerald-600 text-white"
                          : isEligible
                            ? "bg-[var(--accent)] text-white hover:opacity-90"
                            : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {isApplied ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Applied
                        </span>
                      ) : isBusy ? (
                        "Applying..."
                      ) : isEligible ? (
                        "Apply"
                      ) : (
                        `Add ₹${coupon.minOrderValue - subtotal}`
                      )}
                    </button>
                  </div>

                  {!isEligible && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-700">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        Add items worth ₹
                        {(coupon.minOrderValue - subtotal).toLocaleString(
                          "en-IN"
                        )}{" "}
                        more to unlock this offer
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
