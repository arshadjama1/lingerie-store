"use client";

import { useRouter } from "next/navigation";
import React, { startTransition, useEffect } from "react";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[AdminDashboardError] Caught error:", error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
          Operations Center Unavailable
        </h2>

        <p className="mb-6 text-xs leading-relaxed text-gray-500 sm:text-sm">
          We experienced a connection delay retrieving operational data. Please
          try again.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3d0a20] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-[#571030] active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin/dashboard";
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-gray-700 uppercase shadow-xs transition hover:bg-gray-50 active:scale-[0.98]"
          >
            <Home className="h-3.5 w-3.5" />
            Reload Dashboard
          </button>
        </div>

        {error?.digest && (
          <p className="mt-6 font-mono text-[10px] text-gray-400">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
