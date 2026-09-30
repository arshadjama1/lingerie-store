import React from "react";

import { AccountShell } from "@/components/account/AccountShell";

export default function ProfileLoading() {
  return (
    <AccountShell
      title="Profile & Delivery Addresses"
      subtitle="Manage your personal details, contact info, and saved shipping destinations."
    >
      <div className="space-y-10">
        {/* Personal Details Form Skeleton */}
        <div className="animate-pulse space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="h-5 w-36 rounded bg-neutral-300" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-3.5 w-20 rounded bg-neutral-200" />
              <div className="h-10 w-full rounded-xl bg-neutral-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-20 rounded bg-neutral-200" />
              <div className="h-10 w-full rounded-xl bg-neutral-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-24 rounded bg-neutral-200" />
              <div className="h-10 w-full rounded-xl bg-neutral-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-neutral-200" />
              <div className="h-10 w-full rounded-xl bg-neutral-100" />
            </div>
          </div>
          <div className="h-10 w-32 rounded-xl bg-neutral-200" />
        </div>

        {/* Address Manager Skeleton */}
        <div className="space-y-4 border-t border-neutral-200/80 pt-8">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 animate-pulse rounded bg-neutral-300" />
            <div className="h-8 w-32 animate-pulse rounded-xl bg-neutral-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white p-5"
              />
            ))}
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
