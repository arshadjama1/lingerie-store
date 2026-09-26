import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  Heart,
  Package,
  PackageCheck,
  Truck,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

import { getMostRecentActiveOrder } from "@/modules/orders";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

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

const ACTIVE_STATUS_LABELS: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  confirmed: { label: "Confirmed — preparing for dispatch", icon: Package },
  processing: { label: "Packing at warehouse", icon: Package },
  shipped: { label: "In transit with DTDC Express", icon: Truck },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const activeOrder = await getMostRecentActiveOrder(user.id);

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

        {/* Active Order Highlight Banner */}
        {activeOrder &&
          (() => {
            const statusInfo = ACTIVE_STATUS_LABELS[activeOrder.status];
            const StatusIcon = statusInfo?.icon ?? PackageCheck;
            return (
              <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-wider text-violet-500 uppercase">
                        Active Order
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-violet-900">
                        {activeOrder.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-violet-700">
                        {statusInfo?.label ?? activeOrder.status}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <OrderStatusBadge status={activeOrder.status} />
                        <span className="text-xs text-violet-600">
                          {activeOrder.itemCount}{" "}
                          {activeOrder.itemCount === 1 ? "item" : "items"} ·{" "}
                          {formatPrice(activeOrder.total)}
                        </span>
                      </div>
                      {activeOrder.awbNumber && (
                        <p className="mt-1 font-mono text-xs text-violet-600">
                          AWB: {activeOrder.awbNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/account/orders/${activeOrder.id}`}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-800"
                  >
                    Track
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })()}

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
