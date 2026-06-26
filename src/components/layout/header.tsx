"use client";

import Link from "next/link";
import { useState } from "react";

import { Menu, Search, ShoppingBag, X } from "lucide-react";

import { cn } from "@/lib/utils";

// Navigation links — hardcoded for now.
// Milestone 6 (catalog admin) will make these dynamic from the DB.
const NAV_LINKS = [
  { label: "Bras", href: "/bras" },
  { label: "Panties", href: "/panties" },
  { label: "Lingerie Sets", href: "/lingerie-sets" },
  { label: "Shapewear", href: "/shapewear" },
  { label: "Nightwear", href: "/nightwear" },
  { label: "Sale", href: "/sale" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{
          background: "var(--background)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {/* Mobile: hamburger */}
            <button
              className="text-foreground-muted hover:text-foreground -ml-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="text-foreground absolute left-1/2 -translate-x-1/2 font-serif text-lg font-semibold tracking-wider sm:text-xl lg:static lg:translate-x-0"
            >
              Linge
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex lg:items-center lg:gap-6"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground-muted hover:text-foreground text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="text-foreground-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Cart — count wired up in the cart milestone */}
              <Link
                href="/cart"
                className="text-foreground-muted hover:text-foreground relative flex h-9 w-9 items-center justify-center rounded-md transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 flex w-72 flex-col shadow-xl"
            style={{ background: "var(--background)" }}
          >
            <div
              className="flex h-14 items-center justify-between border-b px-4"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="font-serif text-lg font-semibold">LINGE</span>
              <button
                className="text-foreground-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex-1 overflow-y-auto px-4 py-6"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-foreground block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-surface"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
