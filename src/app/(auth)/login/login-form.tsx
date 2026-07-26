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
      setError("Please enter a valid phone number");
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

        // Direct to verification page, appending normalized phone + original redirect target
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
      <div className="text-center">
        <h1 className="text-foreground font-serif text-2xl tracking-tight">
          Welcome to Amara
        </h1>
        <p className="text-foreground-muted mt-1 text-xs">
          Experience premium, everyday luxury tailored for you.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-sm p-1"
        style={{ background: "var(--surface)" }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
            setSuccess(false);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm py-2 text-xs font-semibold transition-all"
          style={{
            background:
              activeTab === "phone" ? "var(--surface-raised)" : "transparent",
            color:
              activeTab === "phone"
                ? "var(--foreground)"
                : "var(--foreground-muted)",
            boxShadow:
              activeTab === "phone" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
          }}
        >
          <Phone className="h-3.5 w-3.5" />
          Phone OTP
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setError(null);
            setSuccess(false);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm py-2 text-xs font-semibold transition-all"
          style={{
            background:
              activeTab === "email" ? "var(--surface-raised)" : "transparent",
            color:
              activeTab === "email"
                ? "var(--foreground)"
                : "var(--foreground-muted)",
            boxShadow:
              activeTab === "email" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          Email Link
        </button>
      </div>

      {/* Message States */}
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

      {success && (
        <div
          className="flex items-start gap-2.5 rounded-sm border p-3.5 text-xs"
          style={{
            background: "rgba(22, 163, 74, 0.05)",
            borderColor: "rgba(22, 163, 74, 0.2)",
            color: "var(--success)",
          }}
        >
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">Magic Link Sent</p>
            <p className="text-foreground-muted leading-relaxed">
              We sent a secure link to{" "}
              <strong className="text-foreground">{email}</strong>. Please check
              your inbox and click the link to sign in.
            </p>
          </div>
        </div>
      )}

      {/* Forms */}
      {!success && activeTab === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-foreground-muted text-[10px] font-bold tracking-wider uppercase"
            >
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-(--foreground-subtle)">
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
                className="w-full rounded-sm border py-2.5 pr-3 pl-11 text-sm tracking-wide transition-colors focus:border-(--border-focus) focus:outline-hidden"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-raised)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <p className="text-[10px] text-(--foreground-subtle)">
              An OTP will be sent to this number for verification.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold transition-all hover:opacity-95 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              <>
                Send Verification OTP
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {!success && activeTab === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-foreground-muted text-[10px] font-bold tracking-wider uppercase"
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
              className="w-full rounded-sm border px-3 py-2.5 text-sm transition-colors focus:border-(--border-focus) focus:outline-hidden"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-raised)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold transition-all hover:opacity-95 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
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
