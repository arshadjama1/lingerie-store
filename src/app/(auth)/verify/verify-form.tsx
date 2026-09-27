"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { AlertCircle, Edit2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const redirect = searchParams.get("redirect") || "/";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);
  const [isPending, startTransition] = useTransition();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { fetchUser } = useAuthStore();

  // Cooldown countdown logic
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // If no phone param, redirect back to login
  useEffect(() => {
    if (!phone) {
      router.replace("/login");
    }
  }, [phone, router]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      triggerVerification(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length !== 6) return;

    const newOtp = pastedData.split("");
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
    triggerVerification(pastedData);
  };

  const triggerVerification = (otpCode: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp: otpCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        await fetchUser();
        toast.success("Verified successfully!");
        router.replace(redirect);
      } catch (err) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Invalid code. Please try again.";
        setError(errMsg);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    });
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setError(null);
    setCooldown(30);
    setOtp(Array(6).fill(""));

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }
      toast.success("Verification code resent!");
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to resend code";
      setError(errMsg);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--accent-plum)]">
          Verify Your Mobile Number
        </h1>
        <p className="mt-1.5 text-xs text-neutral-500">
          Enter the 6-digit code sent to
        </p>
      </div>

      {/* Phone summary + Edit */}
      <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 p-3">
        <div className="text-xs">
          <p className="font-medium text-neutral-500">Sent code to</p>
          <p className="font-bold text-neutral-900">+91 {phone}</p>
        </div>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[var(--accent)] shadow-2xs hover:bg-rose-50"
        >
          <Edit2 className="h-3 w-3" />
          <span>Edit Number</span>
        </Link>
      </div>

      {error && (
        <div className="animate-in fade-in flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 6-box OTP digits */}
      <div className="flex justify-between gap-1.5 sm:gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            disabled={isPending}
            className="h-12 w-11 rounded-xl border border-neutral-300 bg-white text-center font-serif text-lg font-bold text-neutral-900 shadow-2xs focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none disabled:opacity-50 sm:h-13 sm:w-12"
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2.5 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isPending}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline disabled:opacity-50 disabled:hover:no-underline"
        >
          <RefreshCw className="h-3 w-3" />
          <span>
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend Verification Code"}
          </span>
        </button>

        {isPending && (
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            <span>Verifying code...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-100/80 bg-rose-50/40 p-3 text-[11px] text-neutral-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>Discreet SMS • 256-Bit SSL Encrypted Security</span>
      </div>
    </div>
  );
}
