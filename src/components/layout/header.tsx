"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import {
  ArrowLeft,
  Heart,
  Menu,
  Package,
  Ruler,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/account/LogoutButton";
import { LogoutModal } from "@/components/account/LogoutModal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

import { UserDropdown } from "./UserDropdown";
import {
  COMBO_QUICK_LINKS,
  MARQUEE_ANNOUNCEMENTS,
  NAV_CATEGORY_LINKS,
} from "./data/navigationData";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Lock body scroll on mobile when search overlay or mobile menu is open
  const [mobileMounted, setMobileMounted] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const isMobileMenuLockedRef = useRef(false);

  useEffect(() => {
    if (mobileOpen) {
      setMobileMounted(true);
      const rAF = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMobileActive(true);
        });
      });
      if (!isMobileMenuLockedRef.current) {
        lockScroll();
        isMobileMenuLockedRef.current = true;
      }
      return () => cancelAnimationFrame(rAF);
    } else {
      setMobileActive(false);
      const timer = setTimeout(() => {
        setMobileMounted(false);
        if (isMobileMenuLockedRef.current) {
          unlockScroll();
          isMobileMenuLockedRef.current = false;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  // Clean up lock on unmount if menu was open
  useEffect(() => {
    return () => {
      if (isMobileMenuLockedRef.current) {
        unlockScroll();
        isMobileMenuLockedRef.current = false;
      }
    };
  }, []);

  // Lock body scroll when mobile search overlay is open
  useEffect(() => {
    if (mobileSearchOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [mobileSearchOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape key to close mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const { cart, openCart } = useCartStore();
  const itemCount = cart?.itemCount || 0;

  const wishlistItems = useWishlistStore((state) => state.items);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const wishlistCount = wishlistItems.length;

  const { isAuthenticated, profile, init } = useAuthStore();

  useEffect(() => {
    const unsub = init();
    return unsub;
  }, [init]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* ── TIER 1: Animated Marquee Trust Strip ─────────────────────── */}
      <div className="overflow-hidden bg-[#3d0a20] py-1.5 text-[11px] font-medium tracking-wide text-white">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-0">
          {[...MARQUEE_ANNOUNCEMENTS, ...MARQUEE_ANNOUNCEMENTS].map(
            (item, i) => (
              <span
                key={i}
                className="flex items-center gap-3 px-6 whitespace-nowrap"
              >
                <span className="inline-block h-1 w-1 rounded-full bg-pink-400" />
                {item}
              </span>
            )
          )}
        </div>
      </div>

      {/* ── TIER 2: Logo (centered) + Search + Action Icons ──────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile hamburger */}
            <button
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-700 transition-colors hover:text-[var(--accent)] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Left spacer on desktop so logo centers */}
            <div className="hidden flex-1 lg:flex lg:items-center lg:gap-5">
              {/* Search bar with live autocomplete dropdown */}
              <SearchAutocomplete className="max-w-md" />
            </div>

            {/* Logo — centered via absolute on desktop */}
            <Link
              href="/"
              className="absolute left-1/2 hidden -translate-x-1/2 font-serif text-3xl font-black tracking-widest text-[#3d0a20] transition-opacity hover:opacity-90 lg:block"
            >
              Surekh
            </Link>

            {/* Mobile Logo */}
            <Link
              href="/"
              className="font-serif text-2xl font-black tracking-widest text-[#3d0a20] lg:hidden"
            >
              Surekh<span className="text-[var(--accent)]">.</span>
            </Link>

            {/* Right Action Icons */}
            <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
              {/* Mobile search button */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] active:scale-95 lg:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <UserDropdown className="hidden sm:block" />

              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist (${wishlistCount} items)`
                    : "Wishlist"
                }
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] leading-none font-bold text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] leading-none font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TIER 3: Category Nav Strip ──────────────────────────────── */}
      <div className="relative z-40 hidden w-full overflow-hidden border-b border-gray-100 bg-white lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="no-scrollbar flex max-w-full items-center justify-between gap-1 overflow-x-auto py-0.5 lg:justify-center"
            aria-label="Main navigation"
          >
            {/* Category standalone links */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              {NAV_CATEGORY_LINKS.map((cat) => {
                const isActive =
                  pathname === cat.href || pathname.startsWith(`${cat.href}/`);
                return (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className={cn(
                      "flex items-center border-b-2 px-3.5 py-3 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors xl:text-xs",
                      isActive
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-transparent text-gray-800 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    )}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <span className="mx-1 h-4 w-px flex-shrink-0 bg-gray-200" />

            {/* Quick deal offer links */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              {COMBO_QUICK_LINKS.map((deal) => (
                <Link
                  key={deal.label}
                  href={deal.href}
                  className="px-2.5 py-3 text-[11px] font-bold tracking-wider whitespace-nowrap text-[var(--accent)] uppercase underline-offset-2 transition-colors hover:underline xl:text-xs"
                >
                  {deal.label}
                </Link>
              ))}

              {/* Sale link */}
              <Link
                href="/sale"
                className="ml-2 rounded-none bg-[var(--accent)] px-3.5 py-1 text-[10px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-dark)] xl:text-[11px]"
              >
                SALE
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────────── */}
      {mobileMounted && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className={cn(
              "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out",
              mobileActive ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <div
            className={cn(
              "fixed inset-y-0 left-0 flex w-80 flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
              mobileActive ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-16 items-center justify-between border-b bg-[var(--surface)] px-5">
              <Link
                href="/"
                className="font-serif text-xl font-black text-[#3d0a20]"
                onClick={() => setMobileOpen(false)}
              >
                Surekh<span className="text-[var(--accent)]">.</span>
              </Link>
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-all hover:bg-rose-50 hover:text-black active:scale-90"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile search — inside drawer with live autocomplete */}
            <div className="border-b px-4 py-3">
              <SearchAutocomplete
                placeholder="Search lingerie..."
                onSelect={() => setMobileOpen(false)}
              />
            </div>

            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-0.5">
                {NAV_CATEGORY_LINKS.map((cat) => {
                  const isActive =
                    pathname === cat.href ||
                    pathname.startsWith(`${cat.href}/`);
                  return (
                    <li key={cat.label}>
                      <Link
                        href={cat.href}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-pink-50 text-[var(--accent)]"
                            : "text-gray-800 hover:bg-pink-50 hover:text-[var(--accent)]"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span>{cat.label}</span>
                      </Link>
                    </li>
                  );
                })}
                <li className="border-t border-gray-100 pt-2">
                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart className="h-4 w-4 text-[var(--accent)]" />
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li className="pt-2">
                      <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] font-serif text-xs font-bold text-white">
                            {profile?.firstName ? (
                              profile.firstName[0].toUpperCase()
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-neutral-900">
                              {profile?.firstName
                                ? `${profile.firstName} ${profile.lastName || ""}`.trim()
                                : "Valued Customer"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <Link
                        href="/account"
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-gray-500" />
                          Account Dashboard
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/orders"
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="h-4 w-4 text-gray-500" />
                          My Orders
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/size-calculator"
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2.5">
                          <Ruler className="h-4 w-4 text-gray-500" />
                          FitCode™ Bra Calculator
                        </span>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                          Quiz
                        </span>
                      </Link>
                    </li>
                    <li>
                      <LogoutButton
                        variant="menu-item"
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-rose-50 hover:text-rose-700"
                        onSuccess={() => setMobileOpen(false)}
                      />
                    </li>
                  </>
                ) : (
                  <>
                    <li className="pt-2">
                      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-center">
                        <p className="font-serif text-sm font-bold text-[var(--accent-plum)]">
                          Welcome to Surekh
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Sign in for express checkout, order tracking &
                          rewards.
                        </p>
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-dark)]"
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    </li>
                    <li>
                      <Link
                        href="/size-calculator"
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2.5">
                          <Ruler className="h-4 w-4 text-gray-500" />
                          FitCode™ Bra Calculator
                        </span>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                          Free
                        </span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              {/* Mobile combo deals */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="mb-3 px-4 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Quick Shop
                </p>
                <div className="flex flex-wrap gap-2 px-2">
                  {COMBO_QUICK_LINKS.map((deal) => (
                    <Link
                      key={deal.label}
                      href={deal.href}
                      className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      {deal.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* ── Mobile Full-Screen Search Overlay ─────────────────────── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          {/* Mobile Search Header */}
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-3 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
              aria-label="Back / Close search"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <SearchAutocomplete
                autoFocus
                placeholder="Search bras, panties, loungewear..."
                isMobileOverlay={true}
                onSelect={() => setMobileSearchOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <CartDrawer />

      {/* Global Sign Out Confirmation Modal */}
      <LogoutModal />
    </header>
  );
}
