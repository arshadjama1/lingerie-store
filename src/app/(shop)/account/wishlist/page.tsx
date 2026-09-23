import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { WishlistGrid } from "@/components/wishlist/wishlist-grid";

export const metadata: Metadata = {
  title: "Wishlist | My Account | Surekh",
  description: "View and manage your saved favourites.",
};

export default function AccountWishlistPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pt-6 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Account
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-sm font-medium text-neutral-900">Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            All your saved items across all categories.
          </p>
        </div>

        {/* Grid */}
        <WishlistGrid />
      </div>
    </div>
  );
}
