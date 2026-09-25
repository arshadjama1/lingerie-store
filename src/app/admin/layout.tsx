import type { Metadata } from "next";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminLayoutShell email={user?.email ?? null}>{children}</AdminLayoutShell>
  );
}
