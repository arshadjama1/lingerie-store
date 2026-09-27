"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const errorParam = searchParams.get("error");

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [phoneStep, setPhoneStep] = useState<"enter-phone" | "enter-otp">(
    "enter-phone"
  );
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "auth_failed"
      ? "Authentication failed. Please try again."
      : errorParam === "missing_code"
        ? "Authorization code was missing or expired."
        : null
  );
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { fetchUser } = useAuthStore();

  // Cooldown countdown for OTP / Magic Link
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (phoneStep === "enter-otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [phoneStep]);

  // Handle Phone Submit (Send OTP)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to send OTP. Please try again."
          );
        }

        setPhoneStep("enter-otp");
        setCooldown(30);
        setOtp(Array(6).fill(""));
        toast.success(`Verification code sent to +91 ${cleanPhone}`);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to send OTP";
        setError(errMsg);
      }
    });
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance to next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      triggerVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length !== 6) return;

    const digits = pasted.split("");
    setOtp(digits);
    otpInputRefs.current[5]?.focus();
    triggerVerifyOtp(pasted);
  };

  const triggerVerifyOtp = (otpCode: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const cleanPhone = phone.replace(/\D/g, "");
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, otp: otpCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid or expired OTP");
        }

        await fetchUser();
        toast.success("Signed in successfully!");
        router.push(redirect);
        router.refresh();
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Verification failed";
        setError(errMsg);
        setOtp(Array(6).fill(""));
        otpInputRefs.current[0]?.focus();
      }
    });
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setCooldown(30);
    setOtp(Array(6).fill(""));

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");
      toast.success("New verification code sent!");
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to resend code";
      setError(errMsg);
    }
  };

  // Handle Email Magic Link Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailSent(false);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/send-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            redirectTo: redirect,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send magic link");
        }

        setEmailSent(true);
        setCooldown(60);
        toast.success("Magic sign-in link dispatched to your email!");
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to send magic link";
        setError(errMsg);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--accent-plum)]">
          Welcome to Surekh
        </h1>
        <p className="mt-1.5 text-xs text-neutral-500">
          Sign in for express checkout, order tracking & tailored fit sizing.
        </p>
      </div>

      {/* Auth Method Tabs */}
      <div className="flex rounded-xl border border-rose-100 bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
          }}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all ${
            activeTab === "phone"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Mobile OTP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setError(null);
          }}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all ${
            activeTab === "email"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email Link</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="animate-in fade-in flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* ── MOBILE OTP FLOW ── */}
      {activeTab === "phone" && (
        <>
          {phoneStep === "enter-phone" ? (
            /* Step 1: Enter Phone Number */
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-neutral-600">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="98765 43210"
                    maxLength={10}
                    required
                    className="w-full rounded-xl border border-neutral-300 bg-white py-3 pr-3.5 pl-12 text-sm font-semibold tracking-wider text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  A 6-digit verification code will be sent discreetly via SMS.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending || phone.length < 10}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[var(--accent-dark)] disabled:opacity-50"
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Inline 6-Digit OTP Verification */
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5 duration-200">
              <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <div className="text-xs">
                  <p className="font-medium text-neutral-500">Sent code to</p>
                  <p className="font-bold text-neutral-900">+91 {phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("enter-phone");
                    setError(null);
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[var(--accent)] shadow-2xs hover:bg-rose-50"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* 6-box OTP digits */}
              <div>
                <label className="mb-2 block text-center text-xs font-semibold text-neutral-700">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      disabled={isPending}
                      className="h-12 w-11 rounded-xl border border-neutral-300 bg-white text-center font-serif text-lg font-bold text-neutral-900 shadow-2xs focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none disabled:opacity-50 sm:h-13 sm:w-12"
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Status */}
              <div className="flex flex-col items-center gap-2.5 text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
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
            </div>
          )}
        </>
      )}

      {/* ── EMAIL MAGIC LINK FLOW ── */}
      {activeTab === "email" && (
        <>
          {emailSent ? (
            <div className="animate-in fade-in space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="space-y-1">
                    <p className="font-bold text-emerald-950">
                      Magic Link Dispatched!
                    </p>
                    <p className="leading-relaxed text-emerald-800">
                      We sent a secure, one-click sign-in link to{" "}
                      <strong className="font-bold text-neutral-900">
                        {email}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white transition-colors hover:bg-neutral-800"
                >
                  <span>Open Gmail</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setError(null);
                  }}
                  className="text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:underline"
                >
                  Entered wrong email? Change address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
                <p className="text-[11px] text-neutral-400">
                  We'll send a passwordless sign-in link directly to your inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending || !email}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[var(--accent-dark)] disabled:opacity-50"
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* Discreet Shopping & Encrypted Security Strip */}
      <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-100/80 bg-rose-50/40 p-3 text-[11px] text-neutral-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>Discreet SMS • 256-Bit SSL Encrypted Security</span>
      </div>
    </div>
  );
}
