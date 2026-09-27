"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { AlertTriangle, LogOut, ShieldCheck, X } from "lucide-react";

export function LogoutModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignOutModalOpen, closeSignOutModal, signOut } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSignOutModalOpen) {
        closeSignOutModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSignOutModalOpen, closeSignOutModal]);

  if (!isSignOutModalOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setIsPending(true);
      const isProtected = pathname.startsWith("/account");
      await signOut();

      if (isProtected) {
        router.push("/");
      } else {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={closeSignOutModal}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl transition-all sm:p-7">
        {/* Close Button */}
        <button
          onClick={closeSignOutModal}
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h3
              id="logout-modal-title"
              className="font-serif text-lg font-bold text-neutral-900"
            >
              Sign Out of Surekh?
            </h3>
            <p className="text-xs text-neutral-500">
              Confirm your session sign-out
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-xs leading-relaxed text-neutral-600">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p>
              Your saved shopping bag will remain intact on this browser. You
              will need to sign in again to access your order history and saved
              delivery addresses.
            </p>
          </div>
        </div>

        {/* Discreet reassurance */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Your personal account data is safely encrypted.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeSignOutModal}
            disabled={isPending}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing Out...</span>
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
