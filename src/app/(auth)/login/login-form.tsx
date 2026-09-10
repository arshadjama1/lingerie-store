"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const errorParam = searchParams.get("error");

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "auth_failed"
      ? "Authentication failed. Please try again."
      : errorParam === "missing_code"
        ? "Authorization code was missing."
        : null
  );
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send OTP");
        }

        const params = new URLSearchParams();
        params.set("phone", phone);
        if (redirect) params.set("redirect", redirect);

        router.push(`/verify?${params.toString()}`);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errMsg);
      }
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/send-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            redirectTo: redirect,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send magic link");
        }

        setSuccess(true);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errMsg);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase">
          Welcome to Surekh
        </h1>
        <p className="mt-1 text-xs font-light text-gray-500">
          Sign in for express checkout, order tracking & exclusive perks
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-none border border-pink-100 bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
            setSuccess(false);
          }}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-none py-2.5 text-xs font-black tracking-wider uppercase transition-all ${
            activeTab === "phone"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setError(null);
            setSuccess(false);
          }}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-none py-2.5 text-xs font-black tracking-wider uppercase transition-all ${
            activeTab === "email"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Email Link
        </button>
      </div>

      {/* Message States */}
      {error && (
        <div className="flex items-center gap-2 rounded-none border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-none border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <p className="font-bold">Magic Link Sent!</p>
            <p className="leading-relaxed font-light text-emerald-700">
              We sent a secure sign-in link to{" "}
              <strong className="font-bold text-gray-900">{email}</strong>.
              Check your inbox and click the link to log in.
            </p>
          </div>
        </div>
      )}

      {/* Mobile OTP Form */}
      {!success && activeTab === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-[10px] font-black tracking-widest text-[var(--accent-plum)] uppercase"
            >
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-gray-700">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                maxLength={10}
                required
                className="w-full rounded-none border border-gray-200 bg-white py-3 pr-3 pl-11 text-sm font-semibold tracking-wider text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-gray-400">
              A 6-digit OTP code will be sent via SMS for verification.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-[var(--accent)] py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--accent-dark)] disabled:opacity-50"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Send Verification OTP
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Email Form */}
      {!success && activeTab === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[10px] font-black tracking-widest text-[var(--accent-plum)] uppercase"
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
              className="w-full rounded-none border border-gray-200 bg-white px-3.5 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-[var(--accent)] py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:bg-[var(--accent-dark)] disabled:opacity-50"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Send Magic Link
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
