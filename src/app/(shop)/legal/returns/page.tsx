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
  RotateCcw,
  Ruler,
  ShieldAlert,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";

import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Cancellation & Return Policy | Surekh",
  description:
    "Review Surekh's official Cancellation, Return & Exchange Policy. Learn about free pre-dispatch cancellation, DTDC in-transit guidelines, intimate hygiene standards, and 48-hour damaged item claims.",
  openGraph: {
    title: "Cancellation & Return Policy | Surekh",
    description:
      "Important guidelines regarding order cancellation before dispatch, in-transit status with DTDC Express, and intimate hygiene return policies.",
    type: "website",
  },
};

export default function ReturnsPolicyPage() {
  return (
    <LegalShell
      title="Cancellation & Return Policy"
      subtitle="Clear guidelines for cancelling before dispatch, courier transit handoff, and hygiene-compliant returns."
      activeTab="returns"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Legal", href: "/legal/returns" },
        { label: "Cancellation & Returns" },
      ]}
    >
      {/* ── 1. Order Cancellation Policy (Pre-Dispatch vs In-Transit) ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <XCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            1. Order Cancellation Policy
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          We want your shopping experience to be completely worry-free. Because
          we process orders swiftly to ensure fast delivery across India,
          cancellation availability depends on where your order is in the
          fulfillment lifecycle:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Case 1: Pre-Dispatch (Allowed) */}
          <div className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold">Pre-Dispatch Window</h3>
              </div>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                Free Cancellation
              </span>
              <p className="mt-2 text-xs leading-relaxed text-emerald-950/80">
                You can cancel your order free of charge directly from{" "}
                <Link
                  href="/account/orders"
                  className="font-semibold underline"
                >
                  My Orders
                </Link>{" "}
                as long as the status is <strong>Pending</strong> or{" "}
                <strong>Confirmed</strong>.
              </p>
            </div>
            <p className="mt-3 border-t border-emerald-200/60 pt-2 text-[11px] text-emerald-800">
              ✓ Full refund to original payment method within 5–7 business days.
              Inventory is immediately released.
            </p>
          </div>

          {/* Case 2: In-Transit / Dispatched (Locked) */}
          <div className="flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/40 p-5">
            <div>
              <div className="flex items-center gap-2 text-blue-900">
                <Truck className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold">
                  In-Transit / Courier Handoff
                </h3>
              </div>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-800 uppercase">
                Cannot Be Cancelled
              </span>
              <p className="mt-2 text-xs leading-relaxed text-blue-950/80">
                Once an order transitions to <strong>Processing</strong> or{" "}
                <strong>Shipped</strong>, the consignment has been booked and
                manifests with our logistics partner{" "}
                <strong>DTDC Express</strong>.
              </p>
            </div>
            <p className="mt-3 border-t border-blue-200/60 pt-2 text-[11px] text-blue-800">
              ℹ Packages in transit cannot be modified or rerouted. If no longer
              required, delivery may be declined at your doorstep.
            </p>
          </div>

          {/* Case 3: Post-Delivery (Returns & Hygiene) */}
          <div className="flex flex-col justify-between rounded-xl border border-pink-200 bg-pink-50/40 p-5">
            <div>
              <div className="flex items-center gap-2 text-pink-900">
                <RotateCcw className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold">Post-Delivery Stage</h3>
              </div>
              <span className="mt-1 inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[var(--accent-dark)] uppercase">
                Hygiene Policy Applies
              </span>
              <p className="mt-2 text-xs leading-relaxed text-pink-950/80">
                Once delivered, intimate apparel cannot be returned or exchanged
                due to sanitary hygiene regulations, unless defective or
                damaged.
              </p>
            </div>
            <p className="mt-3 border-t border-pink-200/60 pt-2 text-[11px] text-pink-800">
              ℹ Damaged or incorrect shipments must be reported within 48 hours
              of delivery (see Section 3).
            </p>
          </div>
        </div>
      </div>

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
              2. General No Return & Exchange Policy
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Because of hygiene and health regulations associated with
              innerwear items,{" "}
              <strong>
                we do not accept returns, replacements, or exchanges for
                products once they have been purchased
              </strong>
              , unless they arrive damaged or incorrect (as outlined below).
            </p>
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

      {/* 3. Damaged or Incorrect Items */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            3. Damaged or Incorrect Items
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
