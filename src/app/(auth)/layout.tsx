import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50/70 via-white to-rose-50/50 p-4 sm:p-6">
      {/* Brand Header */}
      <Link
        href="/"
        className="mb-8 font-serif text-3xl font-black tracking-widest text-[#3d0a20] transition-opacity hover:opacity-90"
      >
        LINGE<span className="text-[var(--accent)]">.</span>
      </Link>

      {/* Main Sharp Card */}
      <div className="shadow-floating w-full max-w-md rounded-none border border-pink-100 bg-white p-8 sm:p-10">
        {children}
      </div>

      {/* Terms Footer */}
      <p className="mt-8 max-w-xs text-center text-xs leading-relaxed font-light text-gray-500">
        By continuing, you agree to our{" "}
        <Link
          href="/legal/terms"
          className="font-semibold text-gray-700 underline underline-offset-2 hover:text-[var(--accent)]"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="font-semibold text-gray-700 underline underline-offset-2 hover:text-[var(--accent)]"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
