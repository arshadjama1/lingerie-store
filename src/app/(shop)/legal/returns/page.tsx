import type { Metadata } from "next";
import Link from "next/link";

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  Package,
  Ruler,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Return & Exchange Policy | Surekh",
  description:
    "Review Surekh's official Return & Exchange Policy. Learn about our intimate hygiene standards, 48-hour damaged or incorrect item reporting, and fit assistance.",
  openGraph: {
    title: "Return & Exchange Policy | Surekh",
    description:
      "Important hygiene and return policy guidelines for Surekh innerwear orders.",
    type: "website",
  },
};

export default function ReturnsPolicyPage() {
  return (
    <LegalShell
      title="Return & Exchange Policy"
      subtitle="Hygiene standards, size guidance, and resolution procedures for damaged or incorrect deliveries."
      activeTab="returns"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Legal", href: "/legal/returns" },
        { label: "Return & Exchange Policy" },
      ]}
    >
      {/* Hygiene Notice Callout */}
      <div className="rounded-2xl border-2 border-pink-300 bg-gradient-to-br from-[#fff5f8] via-white to-pink-50/50 p-6 shadow-xs sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-[var(--accent)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-[11px] font-bold text-[var(--accent-dark)] uppercase">
              Hygiene & Personal Health Standard
            </span>
            <h2 className="font-serif text-xl font-black text-[var(--accent-plum)] sm:text-2xl">
              1. 15-Day Fit Exchange & Intimate Hygiene Standards
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              At Surekh, we want you to feel completely comfortable and
              supported. Because intimate apparel requires strict personal
              hygiene safeguards, our return and exchange guidelines are
              tailored to the category of product:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <strong className="block font-bold text-emerald-950">
                  ✓ Bras, Camisoles & Lounge Sets
                </strong>
                <p className="mt-1 text-xs text-emerald-900/90">
                  Eligible for a <strong>15-day size exchange</strong> provided
                  the items are unworn, unwashed, unaltered, and all original
                  tags remain securely attached.
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <strong className="block font-bold text-rose-950">
                  ✕ Panties & Undies Multi-Packs
                </strong>
                <p className="mt-1 text-xs text-rose-900/90">
                  For sanitary and health regulations, panties and undie packs
                  are <strong>final sale</strong> and non-exchangeable once the
                  outer hygiene seal or packaging is opened.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide & Fit Assistance Subcard */}
        <div className="mt-6 rounded-xl border border-pink-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Ruler className="h-4 w-4" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[var(--accent-plum)]">
                Size and Fit Assistance
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                We strongly recommend checking our detailed Size Guide on each
                product page before placing your order. If you need help finding
                the right size, our customer support team is always happy to
                assist you prior to purchase.
              </p>
              <div className="pt-2">
                <Link
                  href="/bras"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Browse collections & check sizing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Damaged or Incorrect Items */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            2. Damaged or Incorrect Items
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          We take utmost care in packaging and inspecting your orders. However,
          if you receive an item that is defective, damaged, or incorrect, we
          will make it right.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Timeframe Card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex items-center gap-2 text-amber-900">
              <Clock className="h-4 w-4 text-amber-700" />
              <h3 className="text-sm font-bold">Reporting Timeframe</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-900/90 sm:text-sm">
              You must contact us within <strong>48 hours of delivery</strong>.
              Requests made after 48 hours will unfortunately not be eligible
              for review.
            </p>
          </div>

          {/* Resolution Card */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-center gap-2 text-emerald-950">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <h3 className="text-sm font-bold">Fast Resolution</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-emerald-950/90 sm:text-sm">
              Once our team reviews and verifies the issue, we will coordinate a
              replacement or a resolution promptly.
            </p>
          </div>
        </div>

        {/* Required Proof Section */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-gray-900">
            <Camera className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold">
              Required Proof for Verification
            </h3>
          </div>
          <p className="mt-2 text-xs text-gray-600 sm:text-sm">
            To process a claim for a damaged or incorrect item, please email us
            at{" "}
            <a
              href="mailto:support@surekh.co.in?subject=Damaged%20or%20Incorrect%20Item%20Claim"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              support@surekh.co.in
            </a>{" "}
            with:
          </p>

          <ul className="mt-4 space-y-3 text-xs text-gray-700 sm:text-sm">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[11px] font-bold text-[var(--accent)]">
                1
              </span>
              <span>
                <strong>Order Details:</strong> Your Order Number and registered
                contact details.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[11px] font-bold text-[var(--accent)]">
                2
              </span>
              <span>
                <strong>Visual Evidence:</strong> Clear, unedited photos or an
                unboxing video showing the damaged area or the incorrect product
                received, along with the original packaging.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Helpful Pre-Purchase Tips */}
      <div className="rounded-2xl border border-pink-100 bg-[var(--surface)] p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            How to Ensure the Perfect Fit Before Ordering
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3 sm:text-sm">
          <div className="rounded-xl border border-white bg-white/80 p-4">
            <p className="font-bold text-gray-900">1. Measure Accurately</p>
            <p className="mt-1 text-gray-600">
              Use a soft measuring tape snug against your underbust and fullest
              bust points.
            </p>
          </div>
          <div className="rounded-xl border border-white bg-white/80 p-4">
            <p className="font-bold text-gray-900">2. Review Product Fit</p>
            <p className="mt-1 text-gray-600">
              Each product description lists fabric stretch level and coverage
              details.
            </p>
          </div>
          <div className="rounded-xl border border-white bg-white/80 p-4">
            <p className="font-bold text-gray-900">3. Ask Support First</p>
            <p className="mt-1 text-gray-600">
              Unsure between sizes? Reach out to our team at
              support@surekh.co.in anytime.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-pink-200/60 pt-5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <AlertCircle className="h-4 w-4 text-[var(--accent)]" />
            <span>
              Always keep original package tags until you inspect the outer
              garment condition.
            </span>
          </div>
          <a
            href="mailto:support@surekh.co.in"
            className="inline-flex items-center gap-1.5 rounded-none bg-[var(--accent)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-pink-600"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Support
          </a>
        </div>
      </div>
    </LegalShell>
  );
}
