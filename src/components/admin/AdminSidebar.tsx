"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  BarChart3,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RotateCcw,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isPlanned?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders & Shipping",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Coupons & Offers",
    href: "/admin/coupons",
    icon: Tag,
  },
  {
    name: "Reviews Moderation",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    name: "Catalog & Products",
    href: "#",
    icon: Package,
    badge: "Phase 2",
    isPlanned: true,
  },
  {
    name: "Inventory Hub",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    name: "Returns & Exchanges",
    href: "/admin/returns",
    icon: RotateCcw,
  },

  {
    name: "Customer CRM",
    href: "#",
    icon: Users,
    badge: "Phase 5",
    isPlanned: true,
  },
  {
    name: "Financial Reports",
    href: "#",
    icon: BarChart3,
    badge: "Phase 6",
    isPlanned: true,
  },
];

interface AdminSidebarProps {
  email: string | null;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ email, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login?logged_out=true");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
        <Link
          href="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2"
        >
          <span className="font-mono text-base font-bold tracking-widest text-[#3d0a20]">
            SUREKH
          </span>
          <span className="rounded bg-[#3d0a20]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#3d0a20] uppercase">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin" || pathname === "/admin/dashboard"
              : item.href !== "#" && pathname.startsWith(item.href);

          if (item.isPlanned) {
            return (
              <div
                key={item.name}
                className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-gray-400 opacity-60"
                title={`${item.name} is scheduled for rollout in ${item.badge}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#3d0a20] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#3d0a20]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Controls */}
      <div className="border-t border-gray-200 p-4">
        <Link
          href="/"
          target="_blank"
          className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-[#3d0a20] hover:text-[#3d0a20]"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Live Storefront
          </span>
          <span className="text-[10px] text-gray-400">Preview</span>
        </Link>

        {email && (
          <div className="mt-3 truncate px-1 text-[11px] text-gray-500">
            Signed in as: <strong className="text-gray-700">{email}</strong>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
