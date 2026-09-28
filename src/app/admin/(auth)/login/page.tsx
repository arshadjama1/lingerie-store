import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Portal Sign In | Surekh Operations",
  description: "Secure administrative sign-in for Surekh staff and leadership.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
