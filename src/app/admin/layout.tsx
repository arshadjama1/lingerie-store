import type { Metadata } from "next";
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
  // Middleware already blocks unauthenticated/non-admin access at the edge.
  // This is a defence-in-depth fallback in case middleware is misconfigured.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <AdminLayoutShell email={user?.email ?? null}>{children}</AdminLayoutShell>
  );
}
