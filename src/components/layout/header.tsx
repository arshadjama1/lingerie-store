"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { CartDrawer } from "@/components/cart/cart-drawer";

import {
  COMBO_QUICK_LINKS,
  MARQUEE_ANNOUNCEMENTS,
  NAV_MEGA_GROUPS,
} from "./data/navigationData";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { cart, openCart } = useCartStore();
  const itemCount = cart?.itemCount || 0;

  const handleMenuEnter = (name: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(name);
  };
  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 180);
  };

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
              {/* Search bar — left side on desktop */}
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search bras, panties, nightwear, shapewear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-xs transition-all placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Logo — centered via absolute on desktop */}
            <Link
              href="/"
              className="absolute left-1/2 hidden -translate-x-1/2 font-serif text-3xl font-black tracking-widest text-[#3d0a20] transition-opacity hover:opacity-90 lg:block"
            >
              LINGE
              <span className="text-[var(--accent)]">.</span>
            </Link>

            {/* Mobile Logo */}
            <Link
              href="/"
              className="font-serif text-2xl font-black tracking-widest text-[#3d0a20] lg:hidden"
            >
              LINGE<span className="text-[var(--accent)]">.</span>
            </Link>

            {/* Right Action Icons */}
            <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
              <Link
                href="/search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] lg:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href="/account"
                className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)] sm:flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
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

      {/* ── TIER 3: Mega-Menu Nav Strip ──────────────────────────────── */}
      <div className="relative z-40 hidden w-full overflow-hidden border-b border-gray-100 bg-white lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="no-scrollbar flex max-w-full items-center justify-between gap-1 overflow-x-auto py-0.5 lg:justify-center"
            aria-label="Main navigation"
          >
            {/* Category links with mega-menus */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              {Object.keys(NAV_MEGA_GROUPS).map((cat) => (
                <div
                  key={cat}
                  onMouseEnter={() => handleMenuEnter(cat)}
                  onMouseLeave={handleMenuLeave}
                  className="relative"
                >
                  <Link
                    href={`/${cat.toLowerCase()}`}
                    className={cn(
                      "flex items-center gap-1 border-b-2 border-transparent px-3.5 py-3 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] xl:text-xs",
                      activeMenu === cat
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "text-gray-800"
                    )}
                  >
                    {cat}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        activeMenu === cat ? "rotate-180" : ""
                      )}
                    />
                  </Link>

                  {/* Mega Dropdown */}
                  {activeMenu === cat && NAV_MEGA_GROUPS[cat] && (
                    <div
                      className="absolute top-full left-0 z-50 mt-0 min-w-[600px] rounded-b-none border border-gray-100 bg-white shadow-2xl xl:left-1/2 xl:min-w-[640px] xl:-translate-x-1/2"
                      onMouseEnter={() => handleMenuEnter(cat)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="flex gap-0 p-6">
                        {NAV_MEGA_GROUPS[cat].groups.map((group, gi) => (
                          <div
                            key={gi}
                            className="min-w-[130px] flex-1 border-r border-gray-100 pr-4 last:border-r-0 last:pr-0"
                          >
                            <p className="mb-3 border-b border-pink-100 pb-1.5 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                              {group.title}
                            </p>
                            <ul className="space-y-1.5">
                              {group.items.map((item) => (
                                <li key={item.label}>
                                  <Link
                                    href={item.href}
                                    className="block text-xs text-gray-600 transition-colors hover:font-semibold hover:text-[var(--accent)]"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 flex w-80 flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b bg-[var(--surface)] px-5">
              <Link
                href="/"
                className="font-serif text-xl font-black text-[#3d0a20]"
              >
                LINGE<span className="text-[var(--accent)]">.</span>
              </Link>
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:text-black"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="border-b px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search lingerie..."
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-0.5">
                {[
                  ...Object.keys(NAV_MEGA_GROUPS),
                  "Lingerie Sets",
                  "Sale & Offers",
                ].map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/${cat.toLowerCase().replace(/ /g, "-")}`}
                      className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-pink-50 hover:text-[var(--accent)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{cat}</span>
                      {cat === "Sale & Offers" && (
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black text-white uppercase">
                          HOT
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile combo deals */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="mb-3 px-4 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Super Saver Combos
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

      {/* Cart Drawer Overlay */}
      <CartDrawer />
    </header>
  );
}
