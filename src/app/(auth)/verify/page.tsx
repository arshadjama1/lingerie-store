import { Suspense } from "react";

import { VerifyForm } from "./verify-form";

export const metadata = {
  title: "Verify — Amara Lingerie",
  description: "Verify your phone number with the OTP code sent to you.",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--accent)" }}
          />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
