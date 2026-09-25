"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    title: "Executive Dashboard",
    category: "Navigation",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    title: "Orders & Shipments",
    category: "Fulfillment",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    id: "coupons",
    title: "Coupons & Discounts",
    category: "Marketing",
    href: "/admin/coupons",
    icon: Tag,
  },
  {
    id: "create-coupon",
    title: "Create New Coupon",
    category: "Marketing",
    href: "/admin/coupons/new",
    icon: Tag,
  },
  {
    id: "reviews",
    title: "Reviews Moderation",
    category: "Customer Experience",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    id: "storefront",
    title: "Visit Live Storefront",
    category: "Store",
    href: "/",
    icon: ExternalLink,
  },
];

export function AdminCommandPalette({
  isOpen,
  onClose,
}: AdminCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or shortcut
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center border-b border-gray-100 px-4 py-3">
          <Search className="mr-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (ESC to close)"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.href)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#3d0a20]" />
                    <span className="font-medium">{cmd.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
