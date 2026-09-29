import { Search } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-none bg-[var(--surface)]" />
          <div className="h-8 w-64 animate-pulse rounded-none bg-[var(--surface)]" />
          <div className="h-3 w-32 animate-pulse rounded-none bg-[var(--surface)]" />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4">
          {/* Sidebar skeleton */}
          <div className="h-48 animate-pulse rounded-none border border-gray-100 bg-[var(--surface)] lg:col-span-1" />

          {/* Grid skeleton */}
          <div className="lg:col-span-3">
            <div className="mb-6 h-4 w-32 animate-pulse rounded-none bg-[var(--surface)]" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] animate-pulse rounded-none bg-[var(--surface)]" />
                  <div className="h-3 w-3/4 animate-pulse rounded-none bg-[var(--surface)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-none bg-[var(--surface)]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visually-hidden label for screen readers */}
        <span className="sr-only">
          <Search className="inline h-4 w-4" /> Loading search results…
        </span>
      </div>
    </div>
  );
}
