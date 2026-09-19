import Link from "next/link";
import { redirect } from "next/navigation";

import { Heart, Package, User } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | Surekh",
  description: "Manage your orders, profile, and wishlist.",
};

const ACCOUNT_CARDS = [
  {
    icon: Package,
    title: "My Orders",
    subtitle: "Track and manage your orders",
    href: "/account/orders",
  },
  {
    icon: User,
    title: "Profile & Addresses",
    subtitle: "Manage your personal details and delivery addresses",
    href: "/account/profile",
  },
  {
    icon: Heart,
    title: "Wishlist",
    subtitle: "Your saved favourites",
    href: "/account/wishlist",
  },
];

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            My Account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {ACCOUNT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900 group-hover:text-rose-700">
                    {card.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {card.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
