"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

interface AdminNavProps {
  email: string | null;
}

export function AdminNav({ email }: AdminNavProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-gray-200 bg-white px-6">
      {/* Brand */}
      <span className="font-mono text-sm font-bold tracking-widest text-[#3d0a20]">
        SUREKH ADMIN
      </span>

      {/* Center nav */}
      <nav className="ml-10 flex items-center gap-6">
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-[#3d0a20]"
        >
          Orders
        </Link>
        <Link
          href="/admin/coupons"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-[#3d0a20]"
        >
          Coupons
        </Link>
      </nav>

      {/* Right: email + sign-out */}
      <div className="ml-auto flex items-center gap-4">
        {email && (
          <span className="hidden text-xs text-gray-500 sm:block">{email}</span>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-none border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#3d0a20] hover:text-[#3d0a20]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
