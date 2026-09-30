"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import {
  Compass,
  Heart,
  LogOut,
  MapPin,
  Package,
  Ruler,
  ShieldCheck,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface UserDropdownProps {
  className?: string;
}

export function UserDropdown({ className }: UserDropdownProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, isAuthenticated, openSignOutModal } = useAuthStore();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Click outside & Escape key listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || null;

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ""}`.toUpperCase()
    : displayName
      ? displayName.slice(0, 2).toUpperCase()
      : null;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors",
          isOpen
            ? "bg-rose-100 text-[var(--accent)]"
            : "text-neutral-700 hover:bg-rose-50 hover:text-[var(--accent)]"
        )}
        aria-label="Account Menu"
        aria-expanded={isOpen}
      >
        {isAuthenticated && initials ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[11px] font-bold text-[var(--accent-plum)]">
            {initials}
          </span>
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-rose-100/80 bg-white shadow-xl ring-1 ring-black/5 duration-150">
          {isAuthenticated ? (
            /* ── AUTHENTICATED USER STATE ── */
            <div className="divide-y divide-neutral-100">
              {/* Header Profile Info */}
              <div className="bg-gradient-to-b from-rose-50/60 to-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-serif text-sm font-bold text-white shadow-xs">
                    {initials || <User className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {displayName || "Valued Shopper"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {profile?.email ||
                        user?.email ||
                        profile?.phone ||
                        user?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-1.5">
                <Link
                  href="/account"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <Compass className="h-4 w-4 text-neutral-400" />
                  <span>Account Dashboard</span>
                </Link>

                <Link
                  href="/account/orders"
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="h-4 w-4 text-neutral-400" />
                    <span>My Orders</span>
                  </span>
                </Link>

                <Link
                  href="/account/profile"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span>Profile & Saved Addresses</span>
                </Link>

                <Link
                  href="/size-calculator"
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2.5">
                    <Ruler className="h-4 w-4 text-neutral-400" />
                    <span>My Fit & Bra Calculator</span>
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                    Quiz
                  </span>
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart className="h-4 w-4 text-neutral-400" />
                  <span>My Wishlist</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openSignOutModal();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── GUEST / LOGGED OUT STATE ── */
            <div className="divide-y divide-neutral-100">
              <div className="bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-white px-5 py-5 text-center">
                <p className="font-serif text-base font-bold text-[var(--accent-plum)]">
                  Welcome to Surekh
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Express checkout, order tracking & tailored intimate sizing.
                </p>

                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-[var(--accent-dark)]"
                >
                  Sign In / Register
                </Link>
              </div>

              <div className="p-1.5">
                <Link
                  href="/login?redirect=/account/orders"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="h-4 w-4 text-neutral-400" />
                  <span>Track an Order</span>
                </Link>

                <Link
                  href="/size-calculator"
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2.5">
                    <Ruler className="h-4 w-4 text-neutral-400" />
                    <span>FitCode™ Bra Calculator</span>
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                    Free
                  </span>
                </Link>

                <Link
                  href="/shipping"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-pink-50/70 hover:text-[var(--accent)]"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4 text-neutral-400" />
                  <span>Discreet Shipping & Returns</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
