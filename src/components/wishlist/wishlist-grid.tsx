"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useWishlistStore } from "@/stores/useWishlistStore";
import { LogIn, Sparkles } from "lucide-react";

import { WishlistEmptyState } from "./wishlist-empty-state";
import { WishlistItemCard } from "./wishlist-item-card";

export function WishlistGrid() {
  const { items, isLoading, isAuthenticated, hasHydrated, fetchWishlist } =
    useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Loading skeleton during initial fetch if hydrated and no items loaded yet
  if (!hasHydrated || (isLoading && items.length === 0)) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex animate-pulse flex-col border border-neutral-100 bg-white p-3"
          >
            <div className="mb-3 aspect-[3/4] bg-neutral-100" />
            <div className="mb-2 h-3 w-1/3 bg-neutral-100" />
            <div className="mb-4 h-4 w-3/4 bg-neutral-100" />
            <div className="mt-auto h-8 w-full bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Guest sync callout banner */}
      {isAuthenticated === false && (
        <div className="flex flex-col justify-between gap-3 border border-pink-200 bg-pink-50/70 px-4 py-3 text-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-neutral-800">
            <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span>
              <strong>Guest Wishlist:</strong> Your saved items are currently
              stored only on this browser.
            </span>
          </div>
          <Link
            href="/login?redirect=/wishlist"
            className="inline-flex items-center gap-1.5 font-bold whitespace-nowrap text-[var(--accent)] hover:underline"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign in to sync across devices</span>
          </Link>
        </div>
      )}

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
