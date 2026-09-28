"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";
  const errorParam = searchParams.get("error");
  const isLoggedOut = searchParams.get("logged_out") === "true";

  const [authMethod, setAuthMethod] = useState<"password" | "magic-link">(
    "password"
  );
  const [isForgotView, setIsForgotView] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [error, setError] = useState<string | null>(
    errorParam === "forbidden"
      ? "Access restricted: Your account does not have staff or administrator privileges."
      : errorParam === "session_expired"
        ? "Your session has expired. Please sign in again."
        : null
  );
  const [infoMessage, setInfoMessage] = useState<string | null>(
    isLoggedOut
      ? "You have been signed out of the administrative console."
      : null
  );
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 1. Password Login Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            redirectTo: redirect,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Authentication failed.");
        }

        toast.success("Identity verified. Redirecting to operations...");
        const targetUrl = data.redirect || "/admin/dashboard";
        router.push(targetUrl);
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to sign in.";
        setError(msg);
      }
    });
  };

  // 2. Magic Link Login Handler
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email || !email.includes("@")) {
      setError("Please provide a valid administrative email.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/send-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            redirectTo: redirect,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to dispatch magic link.");
        }

        setMagicLinkSent(true);
        toast.success("Magic sign-in link dispatched to your inbox!");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to send link.";
        setError(msg);
      }
    });
  };

  // 3. Forgot Password Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter your registered administrative email.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to process password recovery.");
        }

        setIsForgotSuccess(true);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Recovery request failed.";
        setError(msg);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          {isForgotView
            ? "Recover Administrative Access"
            : "Staff Authentication"}
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          {isForgotView
            ? "Enter your staff email to receive a password reset link."
            : "Sign in with your verified credentials to access operations."}
        </p>
      </div>

      {/* Info / Signout Notice */}
      {infoMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* FORGOT PASSWORD VIEW */}
      {isForgotView ? (
        <div className="space-y-4">
          {isForgotSuccess ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-200">
                      Recovery Link Dispatched
                    </p>
                    <p className="leading-relaxed text-emerald-300/80">
                      If an active admin account exists for{" "}
                      <strong className="text-white">{email}</strong>, you will
                      receive a password reset link shortly.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsForgotView(false);
                  setIsForgotSuccess(false);
                  setError(null);
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700"
              >
                <span>Back to Sign In</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@surekh.com"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-3.5 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#3d0a20] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:from-rose-500 hover:to-[#571030] disabled:opacity-50"
                >
                  {isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Send Recovery Instructions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(false);
                    setError(null);
                  }}
                  className="py-2 text-center text-xs font-medium text-neutral-400 transition hover:text-white"
                >
                  Cancel and return to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* STANDARD SIGN IN VIEW */
        <div className="space-y-5">
          {/* Method Selector Tabs */}
          <div className="flex rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("password");
                setError(null);
              }}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
                authMethod === "password"
                  ? "bg-rose-600/90 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("magic-link");
                setError(null);
              }}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
                authMethod === "magic-link"
                  ? "bg-rose-600/90 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Magic Link</span>
            </button>
          </div>

          {/* TAB 1: PASSWORD SIGN IN */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@surekh.com"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-3.5 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotView(true);
                      setError(null);
                    }}
                    className="text-xs font-medium text-rose-300 hover:text-rose-200 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-10 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember session checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-rose-600 focus:ring-rose-500 focus:ring-offset-neutral-900"
                />
                <label
                  htmlFor="remember-me"
                  className="cursor-pointer text-xs text-neutral-400 select-none"
                >
                  Keep me signed in on this workstation
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending || !email || !password}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#3d0a20] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:from-rose-500 hover:to-[#571030] disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying Authority...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Operations Console</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: MAGIC LINK */}
          {authMethod === "magic-link" && (
            <div className="space-y-4">
              {magicLinkSent ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <div className="space-y-1">
                        <p className="font-semibold text-emerald-200">
                          One-Click Link Dispatched!
                        </p>
                        <p className="leading-relaxed text-emerald-300/80">
                          We sent a secure, one-time sign-in link to{" "}
                          <strong className="text-white">{email}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMagicLinkSent(false);
                      setError(null);
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Send to a different email</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="magic-email"
                      className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
                    >
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
                      <input
                        id="magic-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@surekh.com"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-3.5 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      A passwordless authentication link will be sent to your
                      inbox.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || !email}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#3d0a20] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:from-rose-500 hover:to-[#571030] disabled:opacity-50"
                  >
                    {isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Send Magic Link</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
