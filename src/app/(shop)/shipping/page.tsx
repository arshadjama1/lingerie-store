import type { Metadata } from "next";
import Link from "next/link";

import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Surekh",
  description:
    "Review Surekh's official Shipping & Delivery Policy. Free express shipping on orders over ₹1,299, 100% plain discreet packaging, and DTDC live tracking.",
  openGraph: {
    title: "Shipping & Delivery Policy | Surekh",
    description:
      "Free express shipping on orders over ₹1,299 with 100% plain discreet packaging nationwide.",
    type: "website",
  },
};

export default function ShippingPolicyPage() {
  return (
    <LegalShell
      title="Shipping & Delivery Policy"
      subtitle="Transparent shipping rates, discreet packaging assurance, and estimated delivery timelines."
      activeTab="shipping"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Shipping & Delivery Policy" },
      ]}
    >
      {/* 1. Free Shipping & Shipping Rates Callout */}
      <div className="rounded-2xl border-2 border-pink-300 bg-gradient-to-br from-[#fff5f8] via-white to-pink-50/50 p-6 shadow-xs sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-[var(--accent)]">
            <Truck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-[11px] font-bold text-[var(--accent-dark)] uppercase">
              Transparent Shipping Rates
            </span>
            <h2 className="font-serif text-xl font-black text-[var(--accent-plum)] sm:text-2xl">
              1. Delivery Charges & Free Shipping Threshold
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              We strive to keep our logistics as affordable and transparent as
              possible for our customers nationwide.
            </p>
          </div>
        </div>

        {/* Pricing Tier Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2 text-emerald-950">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold">Orders ₹1,299 and Above</h3>
            </div>
            <p className="mt-2 font-serif text-2xl font-black text-emerald-700">
              FREE Express Shipping
            </p>
            <p className="mt-1 text-xs text-emerald-900/80">
              Automatic complimentary express delivery applied at checkout to
              any serviceable pincode in India.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 text-gray-900">
              <Package className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-bold">Orders Under ₹1,299</h3>
            </div>
            <p className="mt-2 font-serif text-2xl font-black text-gray-800">
              ₹99 Flat Delivery Fee
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Covers insured express surface courier dispatch and discreet
              tamper-evident packaging.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 100% Discreet Packaging Guarantee */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Lock className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            2. 100% Plain, Discreet Packaging Guarantee
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          Your privacy is our utmost priority. Every order placed with Surekh is
          treated with complete discretion from our warehouse to your doorstep:
        </p>

        <div className="mt-6 space-y-3.5 text-xs text-gray-700 sm:text-sm">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <strong className="block text-gray-900">
                Zero Exterior Product Identifiers
              </strong>
              <p className="mt-0.5 text-xs text-gray-600">
                The outer shipping box is entirely plain and sturdy. There is no
                mention of innerwear, lingerie, bras, or specific product names
                on the outer box or shipping label.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <strong className="block text-gray-900">
                Tamper-Evident Safety Seal
              </strong>
              <p className="mt-0.5 text-xs text-gray-600">
                Packages are sealed with heavy-duty security tape. If the tape
                appears sliced or tampered upon delivery, please reject the
                package and notify customer support immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Delivery Timelines & Transit Times */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Clock className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            3. Estimated Delivery Timelines
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          All orders are dispatched via our primary express logistics partner,{" "}
          <strong>DTDC Express</strong>. Orders placed before 1:00 PM IST
          (Monday to Saturday) are generally processed and handed over to the
          courier the same business day.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-5">
            <div className="flex items-center gap-2 text-sky-950">
              <MapPin className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold">Metro Cities</h3>
            </div>
            <p className="mt-2 font-serif text-xl font-black text-sky-800">
              2 – 3 Business Days
            </p>
            <p className="mt-1 text-xs text-sky-900/80">
              Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata, Pune,
              Ahmedabad.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center gap-2 text-amber-950">
              <MapPin className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold">Rest of India</h3>
            </div>
            <p className="mt-2 font-serif text-xl font-black text-amber-800">
              4 – 7 Business Days
            </p>
            <p className="mt-1 text-xs text-amber-900/80">
              Tier-2 and Tier-3 towns, regional locations, and remote delivery
              areas.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Cash on Delivery (COD) Rules */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Banknote className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            4. Cash on Delivery (COD)
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          Cash on Delivery is available for most serviceable pin codes across
          India:
        </p>

        <ul className="mt-4 space-y-2.5 text-xs text-gray-700 sm:text-sm">
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[11px] font-bold text-[var(--accent)]">
              ✓
            </span>
            <span>
              <strong>Pincode Verification:</strong> You can check COD
              availability for your location using the pincode checker on any
              product page or at checkout.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[11px] font-bold text-[var(--accent)]">
              ✓
            </span>
            <span>
              <strong>Payment on Handover:</strong> Please ensure the exact cash
              amount is ready for the courier partner upon delivery.
            </span>
          </li>
        </ul>
      </div>

      {/* 5. Tracking Your Shipment */}
      <div className="rounded-2xl border border-pink-100 bg-[var(--surface)] p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            5. Live Order Tracking
          </h2>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          As soon as your parcel is scanned by DTDC, an Air Waybill (AWB)
          consignment number is assigned and sent to you via SMS and Email. You
          can track your parcel anytime directly on our website under{" "}
          <Link
            href="/account/orders"
            className="font-bold text-[var(--accent)] hover:underline"
          >
            My Orders
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-pink-200/60 pt-5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <AlertCircle className="h-4 w-4 text-[var(--accent)]" />
            <span>
              Need shipping assistance? Contact us at support@surekh.co.in.
            </span>
          </div>
          <a
            href="mailto:support@surekh.co.in?subject=Shipping%20Inquiry"
            className="inline-flex items-center gap-1.5 rounded-none bg-[var(--accent)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-pink-600"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact Support
          </a>
        </div>
      </div>
    </LegalShell>
  );
}
