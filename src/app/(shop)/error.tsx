"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { startTransition, useEffect } from "react";

import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[ShopError] Caught storefront error:", error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8f7]/50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="mb-2 font-serif text-2xl font-bold tracking-tight text-stone-900">
          Unable to Load Content
        </h2>

        <p className="mb-6 text-xs leading-relaxed text-stone-600 sm:text-sm">
          We encountered a temporary connection glitch while loading this page.
          Please try refreshing.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-stone-800 active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-stone-700 uppercase shadow-xs transition hover:bg-stone-50 active:scale-[0.98]"
          >
            <Home className="h-3.5 w-3.5" />
            Homepage
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-6 font-mono text-[10px] text-stone-400">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
