"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export function AdminResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          throw updateError;
        }

        setIsSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to reset password. The link may have expired.";
        setError(msg);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Password Updated</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Your administrative credentials have been refreshed. Redirecting you
            to the operations console...
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#3d0a20] py-2.5 text-xs font-bold text-white uppercase"
        >
          <span>Continue to Operations</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Set New Admin Password
        </h1>
        <p className="mt-1 text-xs text-neutral-400">
          Please enter a secure password for your administrative account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-10 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-neutral-500" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 py-2.5 pr-3.5 pl-10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !password || !confirmPassword}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#3d0a20] py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:from-rose-500 hover:to-[#571030] disabled:opacity-50"
        >
          {isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Save & Enter Backoffice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
