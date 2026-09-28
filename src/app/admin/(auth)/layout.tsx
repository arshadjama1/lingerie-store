import Link from "next/link";
import React from "react";

import { ArrowLeft, Shield } from "lucide-react";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial from-neutral-900 via-neutral-950 to-black p-4 text-neutral-100 sm:p-6">
      {/* Back to Storefront Link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-400 backdrop-blur-md transition hover:border-neutral-700 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Storefront</span>
        </Link>
      </div>

      {/* Brand & Security Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#571030] to-[#250512] shadow-lg ring-1 shadow-[#3d0a20]/40 ring-rose-500/20">
            <Shield className="h-5 w-5 text-rose-300" />
          </div>
          <span className="font-mono text-xl font-bold tracking-widest text-white">
            SUREKH
          </span>
          <span className="rounded-md bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-rose-300 uppercase ring-1 ring-rose-500/20">
            Backoffice
          </span>
        </div>
        <p className="mt-2 text-xs font-medium tracking-wide text-neutral-400">
          Executive Operations & Commerce Control Panel
        </p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {children}
      </div>

      {/* Security Footer */}
      <div className="mt-8 flex flex-col items-center gap-1.5 text-center text-[11px] text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Encrypted Administrative Session (TLS 1.3)</span>
        </div>
        <p>
          Restricted access for authorized personnel only. All activity is
          logged.
        </p>
      </div>
    </div>
  );
}
