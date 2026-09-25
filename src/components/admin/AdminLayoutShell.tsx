"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ExternalLink, Menu, Search } from "lucide-react";

import { AdminCommandPalette } from "./AdminCommandPalette";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutShellProps {
  email: string | null;
  children: React.ReactNode;
}

export function AdminLayoutShell({ email, children }: AdminLayoutShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar email={email} />
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-64 flex-1 flex-col bg-white">
            <AdminSidebar
              email={email}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick search / Command Palette trigger */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 transition hover:border-[#3d0a20] hover:text-gray-800"
            >
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <span>Search or jump to...</span>
              <kbd className="ml-2 hidden rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 sm:inline-block">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Production Ready
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#3d0a20] hover:text-[#3d0a20] sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Store
            </Link>

            {email && (
              <span className="hidden text-xs text-gray-600 md:inline-block">
                {email}
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Command Palette Modal */}
      <AdminCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
}
