import React from "react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f7]/50 pb-20">
      {/* Category Editorial Header Skeleton */}
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-6 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-12 animate-pulse rounded bg-stone-200" />
            <span className="text-stone-300">/</span>
            <div className="h-3 w-20 animate-pulse rounded bg-stone-200" />
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="h-9 w-48 animate-pulse rounded-md bg-stone-200 sm:h-11 sm:w-64" />
            <div className="h-3.5 max-w-lg animate-pulse rounded bg-stone-100 sm:w-96" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4">
          {/* Desktop Filter Sidebar Skeleton */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="space-y-6 rounded-none border border-stone-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-stone-100" />
              </div>

              {/* Size Filter Section */}
              <div className="space-y-3">
                <div className="h-3.5 w-20 animate-pulse rounded bg-stone-200" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 animate-pulse rounded border border-stone-200 bg-stone-50"
                    />
                  ))}
                </div>
              </div>

              {/* Color Filter Section */}
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <div className="h-3.5 w-16 animate-pulse rounded bg-stone-200" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 animate-pulse rounded-full border border-stone-200 bg-stone-100"
                    />
                  ))}
                </div>
              </div>

              {/* Price Filter Section */}
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <div className="h-3.5 w-24 animate-pulse rounded bg-stone-200" />
                <div className="h-2 w-full animate-pulse rounded bg-stone-100" />
              </div>
            </div>
          </div>

          {/* Catalog Products Area Skeleton */}
          <div className="lg:col-span-3">
            {/* Top Controls Bar Skeleton */}
            <div className="mb-4 flex items-center justify-between border-b border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-8 w-32 animate-pulse rounded bg-stone-100" />
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse flex-col border border-stone-200/80 bg-white"
                >
                  {/* Product Image placeholder */}
                  <div className="aspect-[3/4] w-full bg-stone-100" />

                  {/* Product Details placeholder */}
                  <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                    <div className="h-2.5 w-16 rounded bg-stone-200" />
                    <div className="mt-2 h-3.5 w-3/4 rounded bg-stone-200" />
                    <div className="mt-1 h-3 w-1/2 rounded bg-stone-100" />

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <div className="h-4 w-16 rounded bg-stone-200" />
                      <div className="h-8 w-24 rounded-xs bg-stone-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-10 flex items-center justify-center gap-2 border-t border-stone-200/80 pt-8">
              <div className="h-8 w-20 animate-pulse rounded bg-stone-100" />
              <div className="h-8 w-8 animate-pulse rounded bg-stone-200" />
              <div className="h-8 w-8 animate-pulse rounded bg-stone-100" />
              <div className="h-8 w-20 animate-pulse rounded bg-stone-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
