"use client";

import { useState } from "react";

import { CheckCircle, Loader2, Tag, X } from "lucide-react";

import { formatPrice } from "@/lib/utils";

interface CouponInputProps {
  cartSubtotal: number;
  onApplied: (couponId: string, discountAmount: number, code: string) => void;
  onRemoved: () => void;
  appliedCode?: string | null;
  appliedDiscount?: number;
}

type Status = "idle" | "loading" | "applied" | "error";

export function CouponInput({
  cartSubtotal,
  onApplied,
  onRemoved,
  appliedCode,
  appliedDiscount = 0,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>(
    appliedCode ? "applied" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, cartSubtotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Failed to apply coupon");
        return;
      }

      setStatus("applied");
      setCode("");
      onApplied(data.couponId, data.discountAmount, data.code);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  function handleRemove() {
    setStatus("idle");
    setCode("");
    setErrorMsg("");
    onRemoved();
  }

  // Applied state
  if (status === "applied" && appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
          <span className="font-mono tracking-wide">{appliedCode}</span>
          <span className="font-normal text-emerald-600">
            −{formatPrice(appliedDiscount)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Idle / loading / error state
  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (status === "error") {
                setStatus("idle");
                setErrorMsg("");
              }
            }}
            placeholder="Enter coupon code"
            maxLength={50}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-3 pl-9 font-mono text-sm tracking-wider placeholder:font-sans placeholder:tracking-normal focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !code.trim()}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </form>

      {status === "error" && errorMsg && (
        <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
      )}
    </div>
  );
}
