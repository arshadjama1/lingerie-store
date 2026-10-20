"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError] Unhandled server/root error:", error);
  }, [error]);

  const handleRetry = () => {
    reset();
    window.location.reload();
  };

  return (
    <html lang="en">
      <head>
        <title>Unable to Load Page | Surekh</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f7] p-4 font-sans text-stone-900 antialiased">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="mb-2 font-serif text-2xl font-bold tracking-tight text-stone-900">
            Something went wrong
          </h1>

          <p className="mb-6 text-xs leading-relaxed text-stone-600 sm:text-sm">
            We encountered a temporary connection issue. Please reload to try
            again.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition hover:bg-stone-800 active:scale-[0.98]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-xs font-bold tracking-wider text-stone-700 uppercase shadow-xs transition hover:bg-stone-50 active:scale-[0.98]"
            >
              Return Home
            </button>
          </div>

          {error?.digest && (
            <p className="mt-6 font-mono text-[10px] text-stone-400">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
