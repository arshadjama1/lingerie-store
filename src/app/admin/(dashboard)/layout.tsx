import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Admin | Surekh Luxury",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const proxyUserId = headersList.get("x-admin-user-id");
  const proxyEmail = headersList.get("x-admin-user-email");

  let email = proxyEmail;

  // If proxy verified user, skip the redundant Supabase Auth network call (saving 1-2s TTFB)
  if (!proxyUserId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/admin/login");
    }
    email = user.email ?? null;
  }

  return <AdminLayoutShell email={email}>{children}</AdminLayoutShell>;
}
