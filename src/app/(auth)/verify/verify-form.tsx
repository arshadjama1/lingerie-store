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
    // Only accept numeric inputs
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance cursor to next input block
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are populated
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
        // Go back and clear previous box
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
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

    // Focus the last input block
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

        // Successfully verified, route user to redirect target
        router.replace(redirect);
      } catch (err) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Invalid code. Please try again.";
        setError(errMsg);
        // Reset code inputs on error to allow user to retry cleanly
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
      <div className="text-center">
        <h1 className="text-foreground font-serif text-2xl tracking-tight">
          Security Check
        </h1>
        <p className="text-foreground-muted mt-1.5 text-xs leading-relaxed">
          We sent a 6-digit code to the number <br />
          <strong className="text-foreground">{phone}</strong>
        </p>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 rounded-sm border p-3 text-xs"
          style={{
            background: "rgba(220, 38, 38, 0.05)",
            borderColor: "rgba(220, 38, 38, 0.2)",
            color: "var(--destructive)",
          }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6-box input container */}
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
            className="h-12 w-11 rounded-sm border text-center font-serif text-lg font-semibold transition-all focus:border-(--border-focus) focus:outline-hidden disabled:opacity-50"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-raised)",
              color: "var(--foreground)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-xs font-semibold hover:underline disabled:opacity-60 disabled:hover:no-underline"
          style={{
            color:
              cooldown > 0 ? "var(--foreground-subtle)" : "var(--accent-dark)",
          }}
        >
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Resend Verification Code"}
        </button>

        {isPending && (
          <div className="text-foreground-muted flex items-center gap-2 text-xs">
            <div
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--accent)" }}
            />
            Verifying secure token...
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-1.5 border-t pt-4 text-[10px]"
        style={{ borderColor: "var(--border)" }}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-(--foreground-subtle)" />
        <span className="text-foreground-muted">
          Secure end-to-end encryption
        </span>
      </div>
    </div>
  );
}
