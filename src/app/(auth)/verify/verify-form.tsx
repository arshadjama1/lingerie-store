"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";

import { AlertCircle, ShieldCheck } from "lucide-react";

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
        <h1 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase">
          Security Check
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed font-light text-gray-500">
          Enter the 6-digit verification code sent to <br />
          <strong className="font-bold text-gray-900">+91 {phone}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-none border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6-box OTP digits */}
      <div className="flex justify-between gap-2">
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
            className="h-13 w-12 rounded-none border border-gray-200 bg-white text-center font-serif text-xl font-black text-gray-900 shadow-xs focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="cursor-pointer text-xs font-bold tracking-wider text-[var(--accent)] uppercase hover:underline disabled:opacity-50 disabled:hover:no-underline"
        >
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Resend Verification Code"}
        </button>

        {isPending && (
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            Verifying token...
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 rounded-none border border-pink-100 bg-pink-50/70 p-3 text-[11px] font-medium text-gray-700">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>256-Bit End-to-End SSL Encrypted Security</span>
      </div>
    </div>
  );
}
