import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In | Surekh Storefront",
  description:
    "Sign in to your Surekh account using your mobile phone number or email address.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
