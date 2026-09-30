import React from "react";

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f7]/50 pb-20">
      {/* Header Skeleton */}
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-6 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-12 animate-pulse rounded bg-stone-200" />
            <span className="text-stone-300">/</span>
            <div className="h-3 w-20 animate-pulse rounded bg-stone-200" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-9 w-52 animate-pulse rounded-md bg-stone-200 sm:h-12" />
            <div className="h-3.5 max-w-xl animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:p-6"
            >
              <div className="aspect-square w-full rounded-xl bg-stone-100" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-stone-200" />
                <div className="h-4 w-16 rounded-full bg-rose-100" />
              </div>
              <div className="mt-2 h-3 w-16 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
