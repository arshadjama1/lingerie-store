import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: "var(--surface)" }}
    >
      <Link
        href="/"
        className="mb-10 font-serif text-2xl font-semibold tracking-wider transition-colors hover:text-[var(--accent-dark)]"
        style={{ color: "var(--foreground)" }}
      >
        LINGE
      </Link>
      <div
        className="w-full max-w-sm rounded-sm border p-8 shadow-sm"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border)",
        }}
      >
        {children}
      </div>
      <p
        className="mt-8 text-center text-xs"
        style={{ color: "var(--foreground-muted)" }}
      >
        By continuing, you agree to our{" "}
        <Link href="/legal/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
