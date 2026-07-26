import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — Amara Lingerie",
  description:
    "Sign in to your Amara account using your phone number or email.",
};

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
