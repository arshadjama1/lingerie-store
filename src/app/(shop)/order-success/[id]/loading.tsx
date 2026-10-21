import React from "react";

export default function OrderSuccessLoading() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pt-12 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {/* Confirmation Header Skeleton */}
          <div className="flex flex-col items-center text-center">
            {/* Emerald Success Icon Badge Skeleton */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/70">
              <div className="h-10 w-10 rounded-full bg-emerald-200" />
            </div>

            {/* Title Skeleton */}
            <div className="mt-4 h-7 w-52 rounded-md bg-stone-200" />

            {/* Subtitle Skeleton */}
            <div className="mt-2 h-4 w-72 max-w-full rounded bg-stone-100" />

            {/* Order Number Badge Skeleton */}
            <div className="mt-4 flex h-9 w-60 items-center justify-center rounded-lg bg-neutral-100">
              <div className="h-4 w-44 rounded bg-stone-200" />
            </div>
          </div>

          {/* Estimated Delivery Banner Skeleton */}
          <div className="mt-6 flex h-12 w-full items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4">
            <div className="h-5 w-5 shrink-0 rounded bg-blue-200" />
            <div className="h-4 w-56 rounded bg-blue-200/70" />
          </div>

          {/* Fulfillment Stepper Skeleton */}
          <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50/60 p-5">
            <div className="flex items-center justify-between">
              {Array.from({ length: 4 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-8 w-8 rounded-full bg-stone-200" />
                    <div className="h-2.5 w-14 rounded bg-stone-100" />
                  </div>
                  {i < 3 && <div className="mx-2 h-0.5 flex-1 bg-stone-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Delivery Address Snapshot Skeleton */}
          <div className="mt-6 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-stone-300" />
              <div className="h-4 w-32 rounded bg-stone-200" />
            </div>
            <div className="h-4 w-40 rounded bg-stone-200" />
            <div className="h-3 w-56 rounded bg-stone-100" />
            <div className="h-3 w-48 rounded bg-stone-100" />
            <div className="h-3 w-32 rounded bg-stone-100" />
          </div>

          {/* Purchased Items Skeleton */}
          <div className="mt-6">
            <div className="mb-3 h-4 w-28 rounded bg-stone-200" />
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 rounded bg-stone-200" />
                    <div className="h-3 w-36 rounded bg-stone-100" />
                  </div>
                  <div className="h-5 w-16 rounded bg-stone-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary Skeleton */}
          <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
            <div className="h-4 w-20 rounded bg-stone-200" />
            <div className="h-6 w-24 rounded bg-rose-200" />
          </div>

          {/* Action CTAs Skeleton */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="h-11 w-full rounded-xl bg-rose-200/80 sm:w-44" />
            <div className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-100/70 sm:w-44" />
          </div>

          {/* Cancellation Reassurance Note Skeleton */}
          <div className="mx-auto mt-5 h-3 w-72 max-w-full rounded bg-stone-100" />
        </div>
      </div>
    </div>
  );
}
