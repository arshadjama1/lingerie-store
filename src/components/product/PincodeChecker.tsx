"use client";

import React, { useEffect, useState } from "react";

import { AlertCircle, CheckCircle2, Loader2, Truck } from "lucide-react";

interface ServiceabilityData {
  isServiceable: boolean;
  isCodAvailable: boolean;
  tatDays: number;
}

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load remembered pincode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("surekh_pincode");
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        checkPincode(saved);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const checkPincode = async (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit Indian PIN code");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shipping/serviceability?pincode=${code}`);
      const data = await res.json();

      if (data.success && data.serviceability) {
        setResult(data.serviceability);
        try {
          localStorage.setItem("surekh_pincode", code);
        } catch {
          // ignore
        }
      } else {
        setError(data.error?.message || "Delivery unavailable to this pincode");
        setResult(null);
      }
    } catch {
      // Fallback optimistic standard delivery estimate
      setResult({
        isServiceable: true,
        isCodAvailable: true,
        tatDays: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPincode(pincode);
  };

  const getEstimatedDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(2, days || 3));
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border border-gray-200 bg-gray-50/70 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
          <Truck className="h-4 w-4 text-[var(--accent)]" />
          Delivery & COD Check
        </span>
        {result?.isServiceable && (
          <button
            onClick={() => {
              setResult(null);
              setPincode("");
              try {
                localStorage.removeItem("surekh_pincode");
              } catch {
                // ignore
              }
            }}
            className="cursor-pointer text-[11px] font-bold text-gray-400 underline hover:text-gray-700"
          >
            Change PIN
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPincode(val);
              setError(null);
            }}
            placeholder="Enter 6-digit Pincode"
            className="w-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || pincode.length !== 6}
            className="shrink-0 cursor-pointer bg-slate-900 px-5 py-2 text-xs font-black tracking-wider text-white uppercase transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Check"
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-1.5 pt-1">
          {result.isServiceable ? (
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Delivery by{" "}
                  <strong className="text-gray-900">
                    {getEstimatedDate(result.tatDays)}
                  </strong>{" "}
                  to {pincode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[11px] text-gray-600">
                <span>
                  {result.isCodAvailable
                    ? "✅ Cash on Delivery Available"
                    : "💳 Online Payment Only"}
                </span>
                <span>•</span>
                <span>Free Express Shipping on orders over ₹1,299</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>We currently do not ship to PIN {pincode}.</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
