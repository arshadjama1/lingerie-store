import Link from "next/link";
import React from "react";

import {
  FileText,
  HelpCircle,
  Mail,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/common/breadcrumb";

interface LegalShellProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  activeTab: "privacy" | "terms" | "returns";
  breadcrumbItems: BreadcrumbItem[];
  children: React.ReactNode;
}

const POLICY_TABS = [
  {
    id: "privacy",
    label: "Privacy Policy",
    href: "/legal/privacy",
    icon: ShieldCheck,
  },
  {
    id: "terms",
    label: "Terms of Service",
    href: "/legal/terms",
    icon: FileText,
  },
  {
    id: "returns",
    label: "Return & Exchange Policy",
    href: "/legal/returns",
    icon: RotateCcw,
  },
] as const;

export function LegalShell({
  title,
  subtitle,
  lastUpdated = "September 2026",
  activeTab,
  breadcrumbItems,
  children,
}: LegalShellProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] bg-[#fff5f8]/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[#fff5f8] via-white to-white py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3.5 py-1 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] font-bold tracking-widest text-[var(--accent-plum)] uppercase">
              Legal & Customer Policies
            </span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-black tracking-tight text-[var(--accent-plum)] sm:text-5xl">
            {title}
          </h1>

          <p className="mt-3 text-sm text-gray-600 sm:text-base">{subtitle}</p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Last updated:</span>
            <span className="font-semibold text-gray-700">{lastUpdated}</span>
          </div>

          {/* Policy Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {POLICY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[var(--accent-plum)] text-white shadow-sm"
                      : "border border-[var(--border)] bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/50"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${isActive ? "text-[var(--accent)]" : "text-gray-400"}`}
                  />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Document Body */}
          <div className="space-y-8 lg:col-span-8">{children}</div>

          {/* Sticky Sidebar / Support Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Need Help Card */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-[var(--accent-plum)]">
                  Questions or Assistance?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Our customer care team is available to help clarify any policy
                  details, verify orders, or answer questions.
                </p>

                <div className="mt-5 space-y-3 border-t border-pink-200/60 pt-3 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800">
                      Brand Name:
                    </span>
                    <p className="text-gray-600">Surekh</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">
                      Official Website:
                    </span>
                    <p>
                      <a
                        href="https://www.surekh.co.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline"
                      >
                        www.surekh.co.in
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">
                      Support Email:
                    </span>
                    <p>
                      <a
                        href="mailto:support@surekh.co.in"
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--accent)] hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        support@surekh.co.in
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                <ShieldCheck className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-1.5 text-xs font-bold text-gray-800">
                  100% Genuine & Discreet
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Secure checkout with data encryption and respectful privacy
                  assurance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
