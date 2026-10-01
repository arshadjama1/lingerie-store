import React from "react";

export default function SaleLoading() {
  return (
    <div className="bg-white">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-[var(--border)] bg-[#fff5f8]/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 animate-pulse rounded bg-stone-200" />
            <span className="text-stone-300">/</span>
            <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </div>

      {/* Hero Sale Banner Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#240819] via-[#3d0a20] to-[#5c1032] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-7 w-60 animate-pulse rounded-full bg-white/20" />
          <div className="mx-auto mt-5 h-10 w-3/4 max-w-2xl animate-pulse rounded-md bg-white/20 sm:h-14" />
          <div className="mx-auto mt-4 h-4 w-1/2 max-w-lg animate-pulse rounded bg-white/10" />

          {/* Quick Perks Strip Skeleton */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <div className="h-4 w-44 animate-pulse rounded bg-white/15" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/15" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/15" />
          </div>
        </div>
      </section>

      {/* Main Offers Container Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Section A: Combo Deals Skeleton */}
        <div className="mb-14 space-y-8">
          <div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-rose-100" />
            <div className="mt-2 h-7 w-64 animate-pulse rounded bg-stone-200" />
            <div className="mt-1 h-3.5 w-96 animate-pulse rounded bg-stone-100" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col justify-between rounded-2xl border-2 border-pink-100 bg-white p-6 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-28 rounded-full bg-emerald-100" />
                  <div className="h-6 w-24 rounded-full bg-rose-100" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-6 w-60 rounded bg-stone-200" />
                  <div className="h-3.5 w-80 rounded bg-stone-100" />
                </div>
                <div className="my-6 grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-3.5">
                  <div className="aspect-square rounded-lg bg-stone-200" />
                  <div className="aspect-square rounded-lg bg-stone-200" />
                </div>
                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <div className="h-8 w-24 rounded bg-stone-200" />
                  <div className="h-9 w-28 rounded bg-rose-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section C: Featured Sale Products Grid Skeleton */}
        <div className="space-y-6 border-t border-stone-100 pt-10">
          <div className="h-6 w-52 animate-pulse rounded bg-stone-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse flex-col border border-stone-200/80 bg-white p-3"
              >
                <div className="aspect-[3/4] w-full rounded bg-stone-100" />
                <div className="mt-3 h-3 w-1/3 rounded bg-stone-100" />
                <div className="mt-1.5 h-4 w-3/4 rounded bg-stone-100" />
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="h-4 w-16 rounded bg-stone-100" />
                  <div className="h-7 w-20 rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
