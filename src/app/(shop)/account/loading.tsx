import React from "react";

import { AccountShell } from "@/components/account/AccountShell";

export default function AccountLoading() {
  return (
    <AccountShell
      title="Account Dashboard"
      subtitle="Track active shipments, manage personal details, and view your custom FitCode™ sizing."
    >
      <div className="space-y-6">
        {/* Member Overview Card Skeleton */}
        <div className="animate-pulse rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 rounded-full bg-rose-200" />
              <div className="h-3 w-32 rounded bg-rose-100" />
            </div>
            <div className="h-7 w-48 rounded bg-stone-200" />
            <div className="h-3.5 max-w-sm rounded bg-stone-100" />
          </div>

          {/* Quick Metrics Bar Skeleton */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-rose-100/70 pt-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-xl bg-white/80 p-3"
              >
                <div className="h-6 w-8 rounded bg-stone-200" />
                <div className="mt-1 h-3 w-16 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Ongoing Shipment Skeleton */}
        <div className="h-28 animate-pulse rounded-2xl border border-violet-100 bg-violet-50/50 p-5" />

        {/* Fit Profile Skeleton */}
        <div className="h-32 animate-pulse rounded-2xl border border-rose-100 bg-white p-5" />

        {/* Quick Portal Navigation Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex h-28 animate-pulse flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="h-8 w-8 rounded-xl bg-rose-50" />
              <div className="space-y-1">
                <div className="h-4 w-24 rounded bg-stone-200" />
                <div className="h-3 w-36 rounded bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountShell>
  );
}
