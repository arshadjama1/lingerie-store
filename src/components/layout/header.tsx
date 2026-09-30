"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
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
import { LogoutModal } from "@/components/account/LogoutModal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

import { CategoryFlyout } from "./CategoryFlyout";
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

  // Dynamic Scroll Elevation
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Category Flyout Mega-Menu state
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const flyoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFlyoutEnter = (label: string) => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current);
    }
    setActiveFlyout(label);
  };

  const handleFlyoutLeave = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 150);
  };

  // Close flyout on pathname change or escape key
  useEffect(() => {
    setActiveFlyout(null);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveFlyout(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile Drawer accordion expand/collapse state
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
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* ── TIER 1: Animated Marquee Trust Strip ─────────────────────── */}
      <div
        className={cn(
          "overflow-hidden bg-[#3d0a20] text-[11px] font-medium tracking-wide text-white transition-all duration-300 ease-in-out",
          isScrolled ? "max-h-0 py-0 opacity-0" : "max-h-10 py-1.5 opacity-100"
        )}
      >
        <div className="flex w-max animate-[marquee_30s_linear_infinite] cursor-default items-center gap-0 hover:[animation-play-state:paused]">
          {[...MARQUEE_ANNOUNCEMENTS, ...MARQUEE_ANNOUNCEMENTS].map(
            (item, i) => (
              <span
                key={i}
                className="flex items-center gap-3 px-6 whitespace-nowrap"
              >
                <span className="inline-block h-1 w-1 rounded-full bg-rose-300/80" />
                {item}
              </span>
            )
          )}
        </div>
      </div>

      {/* ── TIER 2: Main Header Bar (Zero-Collision 3-Column Grid) ──── */}
      <div
        className={cn(
          "border-b transition-all duration-300",
          isScrolled
            ? "border-rose-100/70 bg-white/95 shadow-xs backdrop-blur-md"
            : "border-gray-100 bg-white shadow-2xs"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Desktop Header (1024px+) ──────────────────────────────── */}
          <div className="hidden h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
            {/* Column 1: Search Autocomplete (Responsive max width, no logo collision) */}
            <div className="flex items-center justify-start">
              <div className="w-full max-w-[240px] xl:max-w-[320px] 2xl:max-w-[380px]">
                <SearchAutocomplete
                  placeholder="Search bras, panties, sets..."
                  showShortcutHint={true}
                  inputClassName="h-10 bg-rose-50/40 hover:bg-white focus:bg-white border-rose-100/80 focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Column 2: Brand Identity Logo (True mathematical center) */}
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="group flex items-center font-serif text-3xl font-black tracking-[0.2em] text-[#3d0a20] transition-opacity hover:opacity-90"
              >
                Surekh
                <span className="inline-block text-3xl leading-none text-[var(--accent)] transition-transform duration-300 group-hover:scale-125">
                  .
                </span>
              </Link>
            </div>

            {/* Column 3: User, Wishlist, Cart Actions (Unified 40px Baseline) */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <UserDropdown />

              <Link
                href="/wishlist"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist (${wishlistCount} items)`
                    : "Wishlist"
                }
              >
                <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] leading-none font-bold text-white shadow-2xs">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="group relative flex h-10 items-center gap-2 rounded-full pr-3.5 pl-2.5 text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                aria-label="Cart"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] leading-none font-bold text-white shadow-2xs">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-xs font-bold tracking-wide text-neutral-800 uppercase transition-colors group-hover:text-[var(--accent)] xl:inline">
                  Cart
                </span>
              </button>
            </div>
          </div>

          {/* ── Mobile Header (Balanced 3-Column Grid) ───────────────── */}
          <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center sm:h-16 lg:hidden">
            {/* Left: Hamburger + Search Triggers */}
            <div className="flex items-center justify-start gap-1">
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)] active:scale-95"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)] active:scale-95"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Center: Perfectly Centered Brand Logo */}
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="group flex items-center font-serif text-2xl font-black tracking-widest text-[#3d0a20]"
              >
                Surekh
                <span className="text-[var(--accent)] transition-transform duration-300 group-hover:scale-125">
                  .
                </span>
              </Link>
            </div>

            {/* Right: Wishlist + Cart Actions */}
            <div className="flex items-center justify-end gap-1">
              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)] active:scale-95"
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist (${wishlistCount} items)`
                    : "Wishlist"
                }
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] leading-none font-bold text-white shadow-2xs">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)] active:scale-95"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] leading-none font-bold text-white shadow-2xs">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TIER 3: Category Nav Strip with Hover Mega-Menus ─────────── */}
      <div
        onMouseLeave={handleFlyoutLeave}
        className={cn(
          "relative z-40 hidden w-full border-b transition-colors duration-300 lg:block",
          isScrolled
            ? "border-rose-100/60 bg-white/95 backdrop-blur-md"
            : "border-gray-100 bg-white"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="grid h-11 grid-cols-[1fr_auto_1fr] items-center gap-4"
            aria-label="Main navigation"
          >
            {/* Left Column: Discreet Delivery Trust Note */}
            <div className="flex items-center justify-start text-[11px] font-medium tracking-wide text-neutral-500">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Truck className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Discreet Delivery & Free Returns</span>
              </span>
            </div>

            {/* Center Column: Core Categories Aligned Directly Below Logo */}
            <div className="flex items-center justify-center gap-0.5 xl:gap-1">
              {NAV_CATEGORY_LINKS.map((cat) => {
                const isActive =
                  pathname === cat.href || pathname.startsWith(`${cat.href}/`);
                const isFlyoutOpen = activeFlyout === cat.label;
                return (
                  <div
                    key={cat.label}
                    onMouseEnter={() => handleFlyoutEnter(cat.label)}
                    className="relative"
                  >
                    <Link
                      href={cat.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors xl:px-3.5 xl:text-xs",
                        isActive || isFlyoutOpen
                          ? "text-[var(--accent)]"
                          : "text-neutral-800 hover:text-[var(--accent)]"
                      )}
                    >
                      <span>{cat.label}</span>
                      {cat.badge && (
                        <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent)]">
                          {cat.badge}
                        </span>
                      )}
                      {(isActive || isFlyoutOpen) && (
                        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--accent)] transition-all duration-200" />
                      )}
                    </Link>
                  </div>
                );
              })}

              {/* SALE link */}
              <Link
                href="/sale"
                className={cn(
                  "relative flex items-center gap-1 px-3 py-2.5 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors xl:px-3.5 xl:text-xs",
                  pathname === "/sale"
                    ? "text-[var(--accent)]"
                    : "text-[var(--accent)] hover:text-[var(--accent-dark)]"
                )}
              >
                <span>Sale</span>
                <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-2xs">
                  Offers
                </span>
                {pathname === "/sale" && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--accent)] transition-all duration-200" />
                )}
              </Link>
            </div>

            {/* Right Column: Combo Deals Quick Action */}
            <div className="flex items-center justify-end">
              <Link
                href="/p/seamless-undie-pack-of-3"
                className="group inline-flex items-center gap-1.5 rounded-full bg-rose-50/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-neutral-800 transition-all hover:bg-rose-100 hover:text-[var(--accent)]"
              >
                <Sparkles className="h-3 w-3 text-[var(--accent)] transition-transform duration-300 group-hover:rotate-12" />
                <span>
                  3-Packs from{" "}
                  <strong className="font-bold text-[var(--accent)]">
                    ₹750
                  </strong>
                </span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Hover Mega-Menu Flyouts */}
        {NAV_CATEGORY_LINKS.map((cat) => (
          <CategoryFlyout
            key={cat.label}
            category={cat}
            isOpen={activeFlyout === cat.label}
            onMouseEnter={() => handleFlyoutEnter(cat.label)}
            onMouseLeave={handleFlyoutLeave}
            onItemClick={() => setActiveFlyout(null)}
          />
        ))}
      </div>

      {/* ── Mobile Luxury Drawer ──────────────────────────────────────── */}
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
              "fixed inset-y-0 left-0 flex w-[86vw] max-w-[340px] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
              mobileActive ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-rose-100 bg-gradient-to-r from-rose-50/70 via-white to-pink-50/40 px-5">
              <div>
                <Link
                  href="/"
                  className="font-serif text-xl font-black tracking-wider text-[#3d0a20]"
                  onClick={() => setMobileOpen(false)}
                >
                  Surekh<span className="text-[var(--accent)]">.</span>
                </Link>
                <p className="text-[10px] font-medium tracking-wide text-neutral-400">
                  Pure Comfort, Naturally
                </p>
              </div>

              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-rose-100 hover:text-neutral-800 active:scale-90"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Search Action Bar inside drawer */}
            <div className="border-b border-rose-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSearchOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-full border border-rose-100 bg-rose-50/40 px-3.5 py-2 text-xs text-neutral-400 transition-colors hover:border-[var(--accent)] hover:bg-white"
              >
                <Search className="h-4 w-4 text-neutral-400" />
                <span>Search bras, panties, sets...</span>
              </button>
            </div>

            {/* Drawer Content */}
            <nav className="flex-1 px-4 py-3">
              {/* Account Card (Logged-in vs Guest) */}
              <div className="mb-4">
                {isAuthenticated ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-serif text-xs font-bold text-white shadow-xs">
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
                        <p className="text-[10px] text-neutral-500">
                          Welcome back
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-rose-100/70 pt-2.5 text-center">
                      <Link
                        href="/account"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg bg-white px-2 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-2xs hover:text-[var(--accent)]"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg bg-white px-2 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-2xs hover:text-[var(--accent)]"
                      >
                        Orders
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 to-pink-50/40 p-3.5 text-center">
                    <p className="font-serif text-xs font-bold text-[var(--accent-plum)]">
                      Welcome to Surekh
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Sign in for express checkout & order tracking
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2.5 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-dark)]"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Collapsible Category Accordions */}
              <div className="space-y-1">
                <p className="mb-1.5 px-2 text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                  Categories
                </p>

                {NAV_CATEGORY_LINKS.map((cat) => {
                  const isExpanded = !!openAccordions[cat.label];
                  const hasStyles = cat.styles && cat.styles.length > 0;

                  return (
                    <div
                      key={cat.label}
                      className="overflow-hidden rounded-xl border border-transparent transition-colors hover:border-rose-100"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={cat.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex flex-1 items-center justify-between px-3 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:text-[var(--accent)]"
                        >
                          <span className="flex items-center gap-2">
                            <span>{cat.label}</span>
                            {cat.badge && (
                              <span className="py-0.2 rounded-full bg-rose-50 px-1.5 text-[9px] font-bold text-[var(--accent)]">
                                {cat.badge}
                              </span>
                            )}
                          </span>
                        </Link>

                        {hasStyles && (
                          <button
                            type="button"
                            onClick={() => toggleAccordion(cat.label)}
                            className="flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-[var(--accent)]"
                            aria-label={`Toggle ${cat.label} submenu`}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {/* Subcategory links when expanded */}
                      {hasStyles && isExpanded && (
                        <div className="space-y-1 bg-rose-50/30 px-3 py-2 text-xs">
                          {cat.styles?.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-neutral-600 transition-colors hover:bg-white hover:text-[var(--accent)]"
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent)] shadow-2xs">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                          <Link
                            href={cat.href}
                            onClick={() => setMobileOpen(false)}
                            className="mt-1 flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-[var(--accent)]"
                          >
                            <span>Shop All {cat.label}</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Deals Pills */}
              <div className="mt-5 border-t border-rose-100 pt-3.5">
                <p className="mb-2 px-2 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Quick Deals & Combos
                </p>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {COMBO_QUICK_LINKS.map((deal) => (
                    <Link
                      key={deal.label}
                      href={deal.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                    >
                      {deal.label}
                    </Link>
                  ))}
                  <Link
                    href="/sale"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-black text-white shadow-2xs hover:bg-[var(--accent-dark)]"
                  >
                    SALE & OFFERS
                  </Link>
                </div>
              </div>

              {/* Wishlist Link & Logout (if authenticated) */}
              <div className="mt-4 border-t border-rose-100 pt-3">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[var(--accent)]" />
                    Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated && (
                  <div className="mt-1">
                    <LogoutButton
                      variant="menu-item"
                      className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-rose-50 hover:text-rose-700"
                      onSuccess={() => setMobileOpen(false)}
                    />
                  </div>
                )}
              </div>

              {/* Trust Badges Strip inside drawer */}
              <div className="mt-6 rounded-xl border border-rose-100/60 bg-neutral-50/70 p-3 text-[10px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Tamper-Proof Hygiene Sealed Packaging</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Free Express Delivery Above ₹1,299</span>
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
