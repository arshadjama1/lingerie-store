import React from "react";

export default function ShopLoading() {
  return (
    <div className="flex flex-col gap-0 bg-white pb-16">
      {/* 1. Hero Skeleton */}
      <div className="relative h-[calc(100svh-5.5rem)] max-h-[820px] min-h-[520px] w-full animate-pulse bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 sm:h-[calc(100svh-6rem)] sm:min-h-[580px] lg:h-[calc(100dvh-6.75rem)] lg:min-h-[640px] xl:max-h-[860px]">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-14 lg:px-16">
          <div className="max-w-xl space-y-4 lg:max-w-2xl lg:space-y-5">
            <div className="h-6 w-32 rounded-full bg-white/20" />
            <div className="h-10 w-3/4 rounded-md bg-white/20 sm:h-12 lg:h-14" />
            <div className="h-4 w-1/2 rounded-md bg-white/10 sm:h-5" />
            <div className="pt-2">
              <div className="h-11 w-44 rounded-full bg-white/20 sm:h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Super Saver Combo Deals Strip Skeleton */}
      <div className="border-y border-pink-100/60 bg-[#fff5f8]/60 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-40 animate-pulse rounded bg-rose-100" />
          <div className="hidden h-4 w-60 animate-pulse rounded bg-rose-100 sm:block" />
          <div className="h-4 w-32 animate-pulse rounded bg-rose-100" />
        </div>
      </div>

      {/* 3. Category Avatar Bar Skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
        <div className="no-scrollbar flex items-center justify-between gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <div className="h-16 w-16 animate-pulse rounded-full border border-stone-200 bg-stone-100 sm:h-20 sm:w-20" />
              <div className="h-3 w-12 animate-pulse rounded bg-stone-100" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Products Grid Skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-rose-100" />
            <div className="h-6 w-48 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded bg-stone-100" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
  );
}
