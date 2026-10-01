import React from "react";

export default function ProductLoading() {
  return (
    <div className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-12 animate-pulse rounded bg-stone-200" />
          <span className="text-stone-300">/</span>
          <div className="h-3 w-16 animate-pulse rounded bg-stone-200" />
          <span className="text-stone-300">/</span>
          <div className="h-3 w-32 animate-pulse rounded bg-stone-200" />
        </div>

        {/* Product Top Fold: 2-Column Grid */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
          {/* Left Column: Gallery Skeleton */}
          <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
            {/* Thumbnails Skeleton */}
            <div className="flex gap-2.5 overflow-x-auto lg:w-20 lg:flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-16 shrink-0 animate-pulse rounded border border-stone-200 bg-stone-100 lg:w-20"
                />
              ))}
            </div>

            {/* Main Image Viewport Skeleton */}
            <div className="aspect-[3/4] flex-1 animate-pulse border border-stone-200/80 bg-stone-100" />
          </div>

          {/* Right Column: Buy Box Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-rose-200" />
              <div className="h-8 w-4/5 animate-pulse rounded-md bg-stone-200 sm:h-9" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-4 w-24 animate-pulse rounded bg-stone-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-stone-100" />
              </div>
            </div>

            {/* Price Row Skeleton */}
            <div className="flex items-baseline gap-3 border-y border-stone-100 py-4">
              <div className="h-8 w-24 animate-pulse rounded bg-stone-300" />
              <div className="h-5 w-16 animate-pulse rounded bg-stone-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-rose-100" />
            </div>

            {/* Color Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-stone-200" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 animate-pulse rounded-full border border-stone-200 bg-stone-100"
                  />
                ))}
              </div>
            </div>

            {/* Size Selector Skeleton */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-20 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-rose-100" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-12 animate-pulse rounded border border-stone-200 bg-stone-100"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="h-12 w-full animate-pulse rounded-xs bg-stone-200" />
              <div className="h-12 w-full animate-pulse rounded-xs bg-stone-100" />
            </div>

            {/* Pincode Box Skeleton */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <div className="h-3.5 w-32 animate-pulse rounded bg-stone-200" />
              <div className="mt-3 flex gap-2">
                <div className="h-10 flex-1 animate-pulse rounded border border-stone-200 bg-white" />
                <div className="h-10 w-24 animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fold: Accordion Skeleton */}
        <div className="mx-auto mt-16 max-w-4xl space-y-4 border-t border-stone-100 pt-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex h-14 animate-pulse items-center justify-between border-b border-stone-100 px-2"
            >
              <div className="h-4 w-40 rounded bg-stone-200" />
              <div className="h-4 w-4 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
