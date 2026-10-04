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
  Truck,
  User,
  X,
} from "lucide-react";

import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/account/LogoutButton";
import { LogoutModal } from "@/components/account/LogoutModal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SurekhLogo } from "@/components/common/SurekhLogo";
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

  // Dynamic Scroll Elevation & Hide-on-Scroll UX
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const maxScrollY =
            document.documentElement.scrollHeight - window.innerHeight;

          // Determine if scrolled from very top for visual elevation
          setIsScrolled(currentScrollY > 20);

          // Always show header near the top of the page (within 80px)
          if (currentScrollY <= 80) {
            setIsVisible(true);
            lastScrollYRef.current = currentScrollY;
            ticking = false;
            return;
          }

          // Guard against rubber-band bounce at bottom of page
          if (maxScrollY > 0 && currentScrollY >= maxScrollY - 20) {
            ticking = false;
            return;
          }

          const diff = currentScrollY - lastScrollYRef.current;

          // Threshold of 10px to ignore micro-jitters
          if (diff > 10) {
            // Scrolling down -> smoothly hide header
            setIsVisible(false);
            setActiveFlyout(null);
            lastScrollYRef.current = currentScrollY;
          } else if (diff < -10) {
            // Scrolling up -> smoothly reveal header
            setIsVisible(true);
            lastScrollYRef.current = currentScrollY;
          }

          ticking = false;
        });

        ticking = true;
      }
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
    <>
      {/* ── TIER 1: Announcement Marquee Strip (Natural Page Flow) ──────── */}
      <div className="overflow-hidden bg-[#3d0a20] py-1.5 text-[11px] font-medium tracking-wide text-white">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] cursor-default items-center gap-0 hover:[animation-play-state:paused]">
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

      {/* ── TIER 2: Sticky Main Navigation Bar with Smooth Hide-on-Scroll ─ */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-transform duration-300 ease-in-out will-change-transform",
          isVisible || mobileOpen || mobileSearchOpen
            ? "translate-y-0"
            : "-translate-y-full"
        )}
      >
        {/* ── UNIFIED MAIN HEADER BAR ──────────────────────────────────── */}
        <div
          onMouseLeave={handleFlyoutLeave}
          className={cn(
            "relative border-b transition-colors duration-200",
            isScrolled
              ? "border-rose-100/70 bg-white/95 shadow-xs backdrop-blur-md"
              : "border-gray-100 bg-white shadow-2xs"
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* ── Desktop Header (1024px+) ──────────────────────────────── */}
            <div className="hidden h-18 items-center justify-between gap-4 lg:flex xl:gap-6">
              {/* Left: Brand Identity Logo */}
              <Link
                href="/"
                className="group flex shrink-0 items-center transition-opacity hover:opacity-90"
                aria-label="Surekh Home"
              >
                <SurekhLogo
                  variant="horizontal"
                  theme="dark"
                  className="h-10 w-auto xl:h-11"
                  priority
                />
              </Link>

              {/* Center: Primary Category Navigation with Hover Flyout Triggers */}
              <nav
                className="flex h-full items-center gap-0.5 xl:gap-2"
                aria-label="Main navigation"
              >
                {NAV_CATEGORY_LINKS.map((cat) => {
                  const isActive =
                    pathname === cat.href ||
                    pathname.startsWith(`${cat.href}/`);
                  const isFlyoutOpen = activeFlyout === cat.label;
                  return (
                    <div
                      key={cat.label}
                      onMouseEnter={() => handleFlyoutEnter(cat.label)}
                      className="relative flex h-full items-center"
                    >
                      <Link
                        href={cat.href}
                        className={cn(
                          "relative flex h-full items-center gap-1.5 px-3 text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-colors xl:px-4 xl:text-[13px]",
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
                        {/* Active underline indicator */}
                        {(isActive || isFlyoutOpen) && (
                          <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--accent)] transition-all duration-200" />
                        )}
                      </Link>
                    </div>
                  );
                })}

                {/* High-Contrast SALE link */}
                <div className="relative flex h-full items-center">
                  <Link
                    href="/sale"
                    className={cn(
                      "relative flex h-full items-center gap-1.5 px-3 text-xs font-black tracking-wider whitespace-nowrap uppercase transition-colors xl:px-4 xl:text-[13px]",
                      pathname === "/sale"
                        ? "text-rose-600"
                        : "text-rose-600 hover:text-rose-700"
                    )}
                  >
                    <span>Sale</span>
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black text-rose-700">
                      Offer
                    </span>
                    {pathname === "/sale" && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-rose-600 transition-all duration-200" />
                    )}
                  </Link>
                </div>
              </nav>

              {/* Right: Search + Account + Wishlist + Cart */}
              <div className="flex shrink-0 items-center justify-end gap-2 xl:gap-3">
                {/* Responsive expanding search bar */}
                <div className="w-36 transition-all duration-300 focus-within:w-56 xl:w-56 xl:focus-within:w-68 2xl:w-64 2xl:focus-within:w-76">
                  <SearchAutocomplete
                    placeholder="Search products..."
                    showShortcutHint={true}
                    dropdownAlign="right"
                    inputClassName="bg-rose-50/40 hover:bg-white focus:bg-white border-rose-100/80 focus:border-[var(--accent)] shadow-2xs h-9 text-xs"
                  />
                </div>

                {/* User Dropdown */}
                <UserDropdown />

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
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

                {/* Cart Button */}
                <button
                  onClick={openCart}
                  className="group relative flex h-9 items-center gap-2 rounded-full pr-3 pl-2.5 text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                  aria-label="Cart"
                >
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] leading-none font-bold text-white shadow-2xs">
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
              {/* Left: Hamburger + Search Triggers (Balanced ~80px) */}
              <div className="flex items-center justify-start gap-0.5">
                <button
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] active:scale-90"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] active:scale-90"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Center: Perfectly Centered Brand Logo */}
              <div className="flex items-center justify-center">
                <Link
                  href="/"
                  className="flex items-center transition-opacity hover:opacity-90"
                  aria-label="Surekh Home"
                >
                  <SurekhLogo
                    variant="horizontal"
                    theme="dark"
                    className="h-8 w-auto sm:h-9"
                    priority
                  />
                </Link>
              </div>

              {/* Right: Wishlist + Cart Actions (Balanced ~80px) */}
              <div className="flex items-center justify-end gap-0.5">
                <Link
                  href="/wishlist"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] active:scale-90"
                  aria-label={
                    wishlistCount > 0
                      ? `Wishlist (${wishlistCount} items)`
                      : "Wishlist"
                  }
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-0.5 text-[10px] leading-none font-bold text-white shadow-2xs">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={openCart}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] active:scale-90"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-0.5 text-[10px] leading-none font-bold text-white shadow-2xs">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
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
      </header>

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
                  className="flex items-center transition-opacity hover:opacity-90"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Surekh Home"
                >
                  <SurekhLogo
                    variant="horizontal-clean"
                    theme="dark"
                    className="h-7 w-auto"
                  />
                </Link>
                <p className="mt-1 text-[9px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Beautiful Lines &bull; Effortless Comfort
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
    </>
  );
}
