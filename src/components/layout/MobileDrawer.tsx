"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  Mail,
  Package,
  Percent,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";

import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/account/LogoutButton";
import { SurekhLogo } from "@/components/common/SurekhLogo";

import {
  COMBO_QUICK_LINKS,
  NAV_CATEGORY_LINKS,
  type NavCategoryLink,
} from "./data/navigationData";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  wishlistCount: number;
  isAuthenticated: boolean;
  profile: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}

// Category visual thumbnails & sub-descriptions
const CATEGORY_META: Record<
  string,
  { image: string; subtitle: string; badge?: string }
> = {
  Bras: {
    image: "/images/home/cat_bras.jpg",
    subtitle: "Wirefree, Padded & Bralettes",
    badge: "Bestsellers",
  },
  Panties: {
    image: "/images/home/cat_panties.jpg",
    subtitle: "Seamless, Bamboo & High-Leg",
    badge: "3-Packs",
  },
  Sets: {
    image: "/images/products/lingerie-set-olive-1.png",
    subtitle: "Tailored 2-Piece Coordinates",
    badge: "Luxe",
  },
  Loungewear: {
    image: "/images/home/cat_nightwear.jpg",
    subtitle: "Modal Camisoles & Sleepwear",
  },
};

export function MobileDrawer({
  isOpen,
  onClose,
  onOpenSearch,
  wishlistCount,
  isAuthenticated,
  profile,
}: MobileDrawerProps) {
  const pathname = usePathname();

  // Mounting and slide animation state
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const isLockedRef = useRef(false);

  // Accordion state - default Bras open for immediate engagement
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    {
      Bras: true,
      Panties: false,
      Sets: false,
      Loungewear: false,
    }
  );

  const toggleAccordion = (label: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Close drawer on path change (only after initial mount)
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isOpen) {
        onClose();
      }
    }
  }, [pathname, isOpen, onClose]);

  // Mount, animation, and scroll lock handling
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const rAF = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActive(true);
        });
      });
      if (!isLockedRef.current) {
        lockScroll();
        isLockedRef.current = true;
      }
      return () => cancelAnimationFrame(rAF);
    } else {
      setActive(false);
      const timer = setTimeout(() => {
        setMounted(false);
        if (isLockedRef.current) {
          unlockScroll();
          isLockedRef.current = false;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clean up lock on unmount
  useEffect(() => {
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
        isLockedRef.current = false;
      }
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
          active ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Drawer Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 flex w-[88vw] max-w-[375px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform sm:rounded-r-3xl",
          active ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Top Header ────────────────────────────────────────── */}
        <div className="flex h-20 items-center justify-between border-b border-rose-100/80 bg-gradient-to-r from-rose-50/80 via-white to-pink-50/50 px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex flex-col transition-opacity hover:opacity-90"
            aria-label="Surekh Home"
          >
            <SurekhLogo
              variant="horizontal"
              theme="dark"
              className="h-8 w-auto sm:h-9"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-200/80 bg-white/90 text-neutral-500 shadow-2xs transition-all hover:bg-rose-50 hover:text-neutral-900 active:scale-90"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Search Input Trigger ──────────────────────────────── */}
        <div className="border-b border-rose-50/90 bg-white px-4 py-3">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex w-full items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/40 px-3.5 py-2.5 text-xs text-neutral-400 shadow-2xs transition-all hover:border-[var(--accent)] hover:bg-white active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-normal text-neutral-500">
                Search bras, panties, sets...
              </span>
            </div>
            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-400 shadow-2xs">
              Search
            </span>
          </button>
        </div>

        {/* ── Scrollable Body ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5">
          {/* Account & Privé Membership Card */}
          <div className="mb-4">
            {isAuthenticated ? (
              <div className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 p-3.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] font-serif text-sm font-bold text-white shadow-xs">
                    {profile?.firstName ? (
                      profile.firstName[0].toUpperCase()
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-neutral-900">
                        {profile?.firstName
                          ? `${profile.firstName} ${profile.lastName || ""}`.trim()
                          : "Valued Member"}
                      </p>
                      <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full bg-rose-100/80 px-1.5 text-[9px] font-bold text-[var(--accent)]">
                        <Sparkles className="h-2.5 w-2.5" />
                        Privé
                      </span>
                    </div>
                    <p className="truncate text-[10px] text-neutral-500">
                      {profile?.email || "Surekh Member"}
                    </p>
                  </div>
                </div>

                {/* Account Action Buttons */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-rose-100/70 pt-2.5 text-center">
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="flex items-center justify-center rounded-xl bg-white px-2.5 py-2 text-[11px] font-semibold text-neutral-700 shadow-2xs transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center justify-center rounded-xl bg-white px-2.5 py-2 text-[11px] font-semibold text-neutral-700 shadow-2xs transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                  >
                    Track Orders
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-[#3d0a20] to-[#250512] p-4 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-rose-200 uppercase backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-rose-300" />
                    Surekh Privé
                  </div>
                  <span className="text-[10px] font-medium text-rose-200/80">
                    100% Privacy
                  </span>
                </div>

                <p className="mt-2 font-serif text-sm font-bold tracking-wide text-white">
                  Join the Surekh Inner Circle
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-100/80">
                  Enjoy express checkout, private invitations, and tailored fit
                  advice.
                </p>

                <div className="mt-3.5 flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-bold text-[#3d0a20] shadow-sm transition-transform hover:bg-rose-50 active:scale-95"
                  >
                    <span>Sign In / Register</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Track
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── High-Value Quick Actions (2x2 Grid) ──────────────── */}
          <div className="mb-5 grid grid-cols-2 gap-2">
            {/* Fit Calculator */}
            <Link
              href="/size-calculator"
              onClick={onClose}
              className="group flex flex-col justify-between rounded-2xl border border-rose-100/90 bg-gradient-to-br from-rose-50/50 to-white p-3 shadow-2xs transition-all hover:border-[var(--accent)] hover:shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-[var(--accent)] transition-transform group-hover:scale-105">
                  <Ruler className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent)]">
                  Quiz
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold text-neutral-900">
                  Find My Size
                </p>
                <p className="text-[10px] text-neutral-500">
                  100% Fit Guarantee
                </p>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={onClose}
              className="group flex flex-col justify-between rounded-2xl border border-rose-100/90 bg-gradient-to-br from-rose-50/50 to-white p-3 shadow-2xs transition-all hover:border-[var(--accent)] hover:shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-[var(--accent)] transition-transform group-hover:scale-105">
                  <Heart className="h-4 w-4" />
                </div>
                {wishlistCount > 0 ? (
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                    {wishlistCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400">Empty</span>
                )}
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold text-neutral-900">Wishlist</p>
                <p className="text-[10px] text-neutral-500">Saved Favorites</p>
              </div>
            </Link>

            {/* Sale & Offers */}
            <Link
              href="/sale"
              onClick={onClose}
              className="group flex flex-col justify-between rounded-2xl border border-rose-200/90 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-white p-3 shadow-2xs transition-all hover:border-[var(--accent)] hover:shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-2xs transition-transform group-hover:scale-105">
                  <Percent className="h-4 w-4" />
                </div>
                <span className="animate-pulse rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase">
                  Sale
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold text-neutral-900">
                  Special Offers
                </p>
                <p className="text-[10px] font-medium text-[var(--accent)]">
                  Up to 40% Off
                </p>
              </div>
            </Link>

            {/* Combos & Packs */}
            <Link
              href="/p/seamless-undie-pack-of-3"
              onClick={onClose}
              className="group flex flex-col justify-between rounded-2xl border border-rose-100/90 bg-gradient-to-br from-rose-50/50 to-white p-3 shadow-2xs transition-all hover:border-[var(--accent)] hover:shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition-transform group-hover:scale-105">
                  <Package className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                  Value
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold text-neutral-900">
                  Value 3-Packs
                </p>
                <p className="text-[10px] text-neutral-500">From ₹750 Only</p>
              </div>
            </Link>
          </div>

          {/* ── Primary Category Accordions ──────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                Explore Collections
              </span>
              <span className="text-[10px] font-medium text-neutral-400">
                Pure Comfort Naturally
              </span>
            </div>

            <div className="space-y-1.5">
              {NAV_CATEGORY_LINKS.map((cat: NavCategoryLink) => {
                const isExpanded = !!openAccordions[cat.label];
                const meta = CATEGORY_META[cat.label];
                const hasStyles = cat.styles && cat.styles.length > 0;

                return (
                  <div
                    key={cat.label}
                    className={cn(
                      "overflow-hidden rounded-2xl border transition-all duration-200",
                      isExpanded
                        ? "border-rose-200 bg-rose-50/20 shadow-2xs"
                        : "border-gray-100 bg-white hover:border-rose-100"
                    )}
                  >
                    {/* Category Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(cat.label)}
                      className="flex w-full cursor-pointer items-center justify-between p-2.5 text-left transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {meta?.image ? (
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-100">
                            <Image
                              src={meta.image}
                              alt={cat.label}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[var(--accent)]">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-neutral-900">
                              {cat.label}
                            </span>
                            {meta?.badge && (
                              <span className="py-0.2 rounded-full bg-rose-100 px-1.5 text-[9px] font-bold text-[var(--accent)]">
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[10px] text-neutral-500">
                            {meta?.subtitle ||
                              `Explore our ${cat.label} collection`}
                          </p>
                        </div>
                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "rotate-180 text-[var(--accent)]"
                          )}
                        />
                      </div>
                    </button>

                    {/* Subcategories & Featured Spotlight */}
                    {hasStyles && isExpanded && (
                      <div className="border-t border-rose-100/70 bg-gradient-to-b from-rose-50/40 to-transparent p-3 pt-2">
                        {/* Subcategory List */}
                        <div className="space-y-1">
                          {cat.styles?.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={onClose}
                              className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-white hover:text-[var(--accent)]"
                            >
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-300 transition-colors group-hover:bg-[var(--accent)]" />
                                <span>{sub.label}</span>
                              </span>
                              {sub.badge && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[var(--accent)] shadow-2xs">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>

                        {/* Category Spotlight Feature Card */}
                        {cat.featured && (
                          <div className="mt-2.5 overflow-hidden rounded-xl border border-rose-100 bg-white p-2.5 shadow-2xs">
                            <div className="flex gap-2.5">
                              {cat.featured.imageUrl && (
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                                  <Image
                                    src={cat.featured.imageUrl}
                                    alt={cat.featured.title}
                                    fill
                                    className="object-contain p-1"
                                    sizes="56px"
                                  />
                                </div>
                              )}
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="line-clamp-1 text-[10px] font-bold text-neutral-900">
                                      {cat.featured.title}
                                    </span>
                                    {cat.featured.badge && (
                                      <span className="py-0.2 shrink-0 rounded bg-rose-50 px-1 text-[8px] font-bold text-[var(--accent)]">
                                        {cat.featured.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-neutral-500">
                                    {cat.featured.description}
                                  </p>
                                </div>
                                <Link
                                  href={cat.featured.href}
                                  onClick={onClose}
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] hover:underline"
                                >
                                  <span>
                                    {cat.featured.ctaText || "Shop Now"}
                                  </span>
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View Full Category Link */}
                        <Link
                          href={cat.href}
                          onClick={onClose}
                          className="mt-2.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-[var(--accent)] shadow-2xs transition-colors hover:bg-rose-50"
                        >
                          <span>Explore All {cat.label}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Quick Combo Deals Strip ───────────────────────────── */}
          <div className="mt-5 border-t border-rose-100/80 pt-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                Trending Combos & Packs
              </span>
              <span className="text-[10px] font-semibold text-rose-500">
                Save More
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {COMBO_QUICK_LINKS.map((deal) => (
                <Link
                  key={deal.label}
                  href={deal.href}
                  onClick={onClose}
                  className="rounded-full border border-pink-200 bg-pink-50/70 px-3 py-1.5 text-[11px] font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white active:scale-95"
                >
                  {deal.label}
                </Link>
              ))}
              <Link
                href="/sale"
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] px-3.5 py-1.5 text-[11px] font-black tracking-wider text-white shadow-2xs hover:opacity-95 active:scale-95"
              >
                SALE & OFFERS
              </Link>
            </div>
          </div>

          {/* ── Logout Button (if authenticated) ──────────────────── */}
          {isAuthenticated && (
            <div className="mt-4 border-t border-rose-100/80 pt-3">
              <LogoutButton
                variant="menu-item"
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-700"
                onSuccess={onClose}
              />
            </div>
          )}

          {/* ── Trust & Hygiene Seal Strip ────────────────────────── */}
          <div className="mt-6 space-y-2 rounded-2xl border border-rose-100/80 bg-neutral-50/80 p-3.5 text-[11px] text-neutral-600">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">
                100% Discreet Packaging in plain unmarked boxes
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[var(--accent)]">
                <Truck className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">
                Free Express Shipping on Orders Above ₹1,299
              </span>
            </div>
          </div>

          {/* ── Concierge & Help Assistance ────────────────────────── */}
          <div className="mt-4 mb-2 flex items-center justify-between rounded-xl border border-rose-100 bg-white p-3 text-xs">
            <div>
              <p className="font-bold text-neutral-800">Need Fit Advice?</p>
              <p className="text-[10px] text-neutral-500">
                Our concierge is here to help
              </p>
            </div>
            <a
              href="mailto:support@surekh.co.in"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-rose-100"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact</span>
            </a>
          </div>

          <p className="mt-4 text-center text-[10px] font-medium text-neutral-400">
            &copy; {new Date().getFullYear()} Surekh Retail Pvt Ltd. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
