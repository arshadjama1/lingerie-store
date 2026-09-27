import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  ChevronRight,
  Heart,
  MapPin,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

import { getUserAddresses } from "@/modules/addresses";
import { getProfile } from "@/modules/auth";
import { getMostRecentActiveOrder, listUserOrders } from "@/modules/orders";

import { AccountShell } from "@/components/account/AccountShell";
import { FitProfileCard } from "@/components/account/FitProfileCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account Dashboard | Surekh",
  description: "Manage your orders, profile, fit sizing, and wishlist.",
};

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

  const [activeOrder, profile, ordersResult, addresses] = await Promise.all([
    getMostRecentActiveOrder(user.id),
    getProfile(user.id),
    listUserOrders(user.id, { page: 1 }).catch(() => ({ total: 0 })),
    getUserAddresses(user.id).catch(() => []),
  ]);

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : null;

  const totalOrders = ordersResult.total;
  const totalAddresses = addresses.length;

  return (
    <AccountShell
      title={displayName ? `Welcome back, ${displayName}` : "Account Dashboard"}
      subtitle="Track active shipments, manage personal details, and view your custom FitCode™ sizing."
    >
      <div className="space-y-6">
        {/* Member Overview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  Surekh Insider
                </span>
                <span className="text-xs text-neutral-500">
                  {profile?.email || user.email || profile?.phone || user.phone}
                </span>
              </div>
              <h2 className="mt-2 font-serif text-xl font-bold text-neutral-900 sm:text-2xl">
                {displayName ? displayName : "Surekh Member"}
              </h2>
              <p className="mt-1 text-xs text-neutral-600">
                Enjoy priority shipping, complimentary size exchanges, and
                member-only preview drops.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-rose-100/70 pt-5">
            <Link
              href="/account/orders"
              className="rounded-xl bg-white/80 p-3 text-center transition-all hover:bg-white hover:shadow-2xs"
            >
              <p className="font-serif text-xl font-bold text-neutral-900">
                {totalOrders}
              </p>
              <p className="text-[11px] font-medium text-neutral-500">
                Total Orders
              </p>
            </Link>

            <div className="rounded-xl bg-white/80 p-3 text-center">
              <p className="font-serif text-xl font-bold text-[var(--accent)]">
                {activeOrder ? "1" : "0"}
              </p>
              <p className="text-[11px] font-medium text-neutral-500">
                Active Shipments
              </p>
            </div>

            <Link
              href="/account/profile"
              className="rounded-xl bg-white/80 p-3 text-center transition-all hover:bg-white hover:shadow-2xs"
            >
              <p className="font-serif text-xl font-bold text-neutral-900">
                {totalAddresses}
              </p>
              <p className="text-[11px] font-medium text-neutral-500">
                Saved Addresses
              </p>
            </Link>
          </div>
        </div>

        {/* Active Order Highlight Banner */}
        {activeOrder &&
          (() => {
            const statusInfo = ACTIVE_STATUS_LABELS[activeOrder.status];
            const StatusIcon = statusInfo?.icon ?? PackageCheck;
            return (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/90 p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-2xs">
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-violet-600 uppercase">
                          Ongoing Shipment
                        </span>
                        <OrderStatusBadge status={activeOrder.status} />
                      </div>
                      <p className="mt-0.5 font-mono text-sm font-bold text-violet-950">
                        {activeOrder.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-violet-700">
                        {statusInfo?.label ?? activeOrder.status}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-violet-600">
                        <span>
                          {activeOrder.itemCount}{" "}
                          {activeOrder.itemCount === 1 ? "item" : "items"} ·{" "}
                          {formatPrice(activeOrder.total)}
                        </span>
                        {activeOrder.awbNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-semibold">
                              AWB: {activeOrder.awbNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/account/orders/${activeOrder.id}`}
                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-800"
                  >
                    <span>Track Package</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })()}

        {/* Sizing & FitCode Profile Showcase */}
        <FitProfileCard />

        {/* Quick Portal Navigation Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/account/orders"
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-rose-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <Package className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-600" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-neutral-900 group-hover:text-rose-700">
                My Orders
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Order receipts, tracking & easy returns
              </p>
            </div>
          </Link>

          <Link
            href="/account/profile"
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-rose-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <MapPin className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-600" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-neutral-900 group-hover:text-rose-700">
                Profile & Addresses
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Manage personal details & delivery destinations
              </p>
            </div>
          </Link>

          <Link
            href="/account/wishlist"
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-rose-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <Heart className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-rose-600" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-neutral-900 group-hover:text-rose-700">
                Saved Wishlist
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Saved intimates, sleepwear & special sets
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
