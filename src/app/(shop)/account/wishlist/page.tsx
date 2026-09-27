import type { Metadata } from "next";

import { AccountShell } from "@/components/account/AccountShell";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";

export const metadata: Metadata = {
  title: "Wishlist | My Account | Surekh",
  description: "View and manage your saved favourites.",
};

export default function AccountWishlistPage() {
  return (
    <AccountShell
      title="Saved Wishlist"
      subtitle="Your saved intimates, sleepwear, and favourite styles."
    >
      <WishlistGrid />
    </AccountShell>
  );
}
