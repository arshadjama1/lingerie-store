import React from "react";

import { AccountShell } from "@/components/account/AccountShell";

export default function OrdersLoading() {
  return (
    <AccountShell
      title="My Orders"
      subtitle="View order status, tracking timeline, invoices, and initiate size exchanges."
    >
      <div className="space-y-4">
        {/* Filter tabs skeleton */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-20 animate-pulse rounded-full bg-neutral-100"
              />
            ))}
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
        </div>

        {/* Order Card Skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-20 rounded bg-neutral-200" />
                    <span className="text-neutral-300">•</span>
                    <div className="h-5 w-24 rounded-full bg-neutral-100" />
                  </div>
                  <div className="h-5 w-32 rounded bg-neutral-300" />
                  <div className="h-3.5 w-48 rounded bg-neutral-100" />
                  <div className="h-3.5 w-40 rounded bg-neutral-100 pt-1" />
                </div>
                <div className="h-8 w-28 rounded-xl bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountShell>
  );
}
