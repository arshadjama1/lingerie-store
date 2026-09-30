import React from "react";

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back Link Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        </div>

        {/* Order Header Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-36 animate-pulse rounded bg-neutral-300" />
            <div className="h-3.5 w-48 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-200" />
        </div>

        <div className="space-y-4">
          {/* Stepper Skeleton */}
          <div className="h-28 animate-pulse rounded-2xl border border-neutral-200 bg-white p-6" />

          {/* Items Ordered Skeleton */}
          <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 h-4 w-32 rounded bg-neutral-200" />
            <div className="space-y-4 divide-y divide-neutral-100">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex justify-between pt-3">
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-neutral-200" />
                    <div className="h-3 w-32 rounded bg-neutral-100" />
                    <div className="h-3 w-20 rounded bg-neutral-100" />
                  </div>
                  <div className="h-4 w-16 rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary Skeleton */}
          <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 h-4 w-36 rounded bg-neutral-200" />
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-3.5 w-20 rounded bg-neutral-100" />
                <div className="h-3.5 w-16 rounded bg-neutral-100" />
              </div>
              <div className="flex justify-between">
                <div className="h-3.5 w-16 rounded bg-neutral-100" />
                <div className="h-3.5 w-14 rounded bg-neutral-100" />
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <div className="h-4 w-20 rounded bg-neutral-300" />
                <div className="h-4 w-20 rounded bg-neutral-300" />
              </div>
            </div>
          </div>

          {/* Delivery Address Skeleton */}
          <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 h-4 w-32 rounded bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-neutral-200" />
              <div className="h-3.5 w-56 rounded bg-neutral-100" />
              <div className="h-3.5 w-48 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
