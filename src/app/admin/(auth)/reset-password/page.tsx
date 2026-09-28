import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Admin Password | Surekh Operations",
  description: "Secure password reset for Surekh administrative staff.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
        </div>
      }
    >
      <AdminResetPasswordForm />
    </Suspense>
  );
}
