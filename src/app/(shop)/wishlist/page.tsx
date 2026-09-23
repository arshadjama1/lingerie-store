import type { Metadata } from "next";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";

export const metadata: Metadata = {
  title: "My Wishlist | Surekh",
  description:
    "View and manage your saved lingerie, nightwear, and intimate wear favorites.",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pt-4 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
          className="mb-4"
        />

        {/* Page Header */}
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Curate and save your favorite intimates, loungewear, and bridal
            pieces.
          </p>
        </div>

        {/* Wishlist Items Grid */}
        <WishlistGrid />
      </div>
    </div>
  );
}
