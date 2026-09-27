"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { Compass, Heart, MapPin, Package, Ruler } from "lucide-react";

import { cn } from "@/lib/utils";

import { LogoutButton } from "./LogoutButton";

const ACCOUNT_NAV_ITEMS = [
  {
    href: "/account",
    label: "Overview",
    icon: Compass,
    exact: true,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: Package,
    exact: false,
  },
  {
    href: "/account/profile",
    label: "Profile & Addresses",
    icon: MapPin,
    exact: false,
  },
  {
    href: "/size-calculator",
    label: "Fit & Sizing",
    icon: Ruler,
    exact: false,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
    exact: false,
  },
];

interface AccountShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AccountShell({ children, title, subtitle }: AccountShellProps) {
  const pathname = usePathname();
  const { user, profile } = useAuthStore();

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "Valued Shopper";

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ""}`.toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-neutral-50/60 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Mobile Horizontal Pill Navigation */}
        <div className="mb-6 lg:hidden">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all",
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-xs"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:bg-rose-50 hover:text-[var(--accent)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-28 space-y-4">
              {/* Profile Card Summary */}
              <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] font-serif text-lg font-bold text-white shadow-xs">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-serif text-base font-bold text-neutral-900">
                      {displayName}
                    </h2>
                    <p className="truncate text-xs text-neutral-500">
                      {profile?.email ||
                        user?.email ||
                        profile?.phone ||
                        user?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xs">
                <ul className="space-y-1">
                  {ACCOUNT_NAV_ITEMS.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                            isActive
                              ? "bg-rose-50 font-bold text-[var(--accent)] shadow-2xs"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-[var(--accent)]"
                                : "text-neutral-400"
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                  <li className="border-t border-neutral-100 pt-1">
                    <LogoutButton
                      variant="menu-item"
                      className="w-full rounded-xl px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50"
                    />
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {title && (
              <div className="mb-6">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
