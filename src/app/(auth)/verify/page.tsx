import { Suspense } from "react";

import { VerifyForm } from "./verify-form";

export const metadata = {
  title: "Security Verification | LINGE Storefront",
  description:
    "Verify your phone number with the 6-digit OTP code sent to your mobile device.",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
