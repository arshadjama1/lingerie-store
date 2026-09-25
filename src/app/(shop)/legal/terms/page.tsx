import type { Metadata } from "next";
import Link from "next/link";

import {
  AlertTriangle,
  CreditCard,
  FileText,
  Gavel,
  Globe,
  HelpCircle,
  Mail,
  MessageSquare,
  Package,
  RefreshCw,
  Scale,
  Shield,
  ShoppingBag,
} from "lucide-react";

import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms and Conditions | Surekh",
  description:
    "Read the official Terms of Service and Conditions of Use for Surekh (www.surekh.co.in). Understand rights, liabilities, pricing, and purchase terms.",
  openGraph: {
    title: "Terms and Conditions | Surekh",
    description:
      "Official Terms of Service and Conditions governing purchases and browsing on Surekh.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="The rules, terms, and guidelines governing your access to and use of Surekh."
      activeTab="terms"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Legal", href: "/legal/terms" },
        { label: "Terms of Service" },
      ]}
    >
      {/* Intro Note */}
      <div className="rounded-2xl border border-pink-200/80 bg-gradient-to-br from-[#fff5f8] to-white p-6 shadow-xs">
        <p className="text-sm leading-relaxed text-gray-700">
          Welcome to{" "}
          <a
            href="https://www.surekh.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            www.surekh.co.in
          </a>{" "}
          (the &ldquo;Site&rdquo;). This website is operated by{" "}
          <strong>Surekh</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;). By visiting our site and/or purchasing products
          from us, you engage in our &ldquo;Service&rdquo; and agree to be bound
          by the following terms and conditions (&ldquo;Terms of Service&rdquo;,
          &ldquo;Terms&rdquo;), including any additional policies referenced
          herein.
        </p>
        <div className="mt-4 rounded-xl border border-pink-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-700">
            <strong>Please read carefully:</strong> By accessing or using any
            part of the site, you agree to be bound by these Terms. If you do
            not agree to all the terms and conditions of this agreement, you may
            not access the website or use any Services.
          </p>
        </div>
      </div>

      {/* 1. Overview and Online Store Terms */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            1. Overview and Online Store Terms
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            <strong>Age of Majority:</strong> By agreeing to these Terms, you
            represent that you are at least the age of majority in your state or
            province of residence, or that you have given us your consent to
            allow any of your minor dependents to use this site.
          </p>
          <p>
            <strong>Prohibited Uses:</strong> You may not use our products or
            services for any illegal or unauthorized purpose, nor violate any
            laws in your jurisdiction (including copyright laws).
          </p>
          <p>
            <strong>Store Platform:</strong> Our store is hosted on e-commerce
            infrastructure that allows us to sell our innerwear products and
            services to you.
          </p>
        </div>
      </div>

      {/* 2. General Conditions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            2. General Conditions
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            We reserve the right to refuse service to anyone for any reason at
            any time.
          </p>
          <p>
            You agree not to reproduce, duplicate, copy, sell, resell, or
            exploit any portion of the Service without express written
            permission by us.
          </p>
          <p>
            Prices for our products are subject to change without notice. We
            reserve the right at any time to modify or discontinue the Service
            (or any part thereof) without notice.
          </p>
        </div>
      </div>

      {/* 3. Products, Pricing, and Accuracy */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            3. Products, Pricing, and Accuracy
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            <strong>Product Descriptions:</strong> We have made every effort to
            display as accurately as possible the colors, images, and details of
            our innerwear products. However, we cannot guarantee that your
            device monitor&apos;s display of any color will be completely
            accurate.
          </p>
          <p>
            <strong>Limitations:</strong> We reserve the right to limit the
            sales of our products to any person, geographic region, or
            jurisdiction, and to limit the quantities of any products we offer.
          </p>
          <p>
            <strong>Errors and Omissions:</strong> Occasionally there may be
            information on our site with typographical errors, inaccuracies, or
            omissions regarding product descriptions, pricing, promotions, and
            availability. We reserve the right to correct any errors and to
            cancel or change orders if any information is inaccurate.
          </p>
        </div>
      </div>

      {/* 4. Billing and Account Information */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <CreditCard className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            4. Billing and Account Information
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            We reserve the right to refuse any order you place with us. We may,
            in our sole discretion, limit or cancel quantities purchased per
            person, household, or order.
          </p>
          <p>
            You agree to provide current, complete, and accurate purchase and
            account information for all store purchases, and to promptly update
            your details (such as email and billing address) so we can complete
            your transactions smoothly.
          </p>
        </div>
      </div>

      {/* 5. Third-Party Links and Tools */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Globe className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            5. Third-Party Links and Tools
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            Certain content, products, and services available via our Service
            may include materials from third parties (such as payment gateways
            or delivery couriers). We are not responsible for examining or
            evaluating third-party content and assume no liability for any
            third-party materials or websites.
          </p>
        </div>
      </div>

      {/* 6. User Comments and Submissions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            6. User Comments and Submissions
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            If you send us creative ideas, suggestions, proposals, or other
            materials (collectively, &ldquo;comments&rdquo;), you agree that we
            may, at any time, without restriction, edit, copy, publish,
            distribute, and translate them. We are under no obligation to
            maintain any comments in confidence or pay compensation.
          </p>
        </div>
      </div>

      {/* 7. Personal Information */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Shield className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            7. Personal Information
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            Your submission of personal information through the store is
            governed by our Privacy Policy. Please review our{" "}
            <Link
              href="/legal/privacy"
              className="font-medium text-[var(--accent)] underline hover:text-[var(--accent-dark)]"
            >
              Privacy Policy
            </Link>{" "}
            to understand our practices.
          </p>
        </div>
      </div>

      {/* 8. Disclaimer of Warranties; Limitation of Liability */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            8. Disclaimer of Warranties; Limitation of Liability
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            Our Service and all products delivered to you are provided &lsquo;as
            is&rsquo; and &lsquo;as available&rsquo; for your use, without any
            representation, warranties, or conditions of any kind, either
            express or implied.
          </p>
          <p>
            In no case shall Surekh, our directors, officers, employees, or
            affiliates be liable for any direct, indirect, incidental, punitive,
            or consequential damages arising from your use of our service or any
            products procured from us.
          </p>
        </div>
      </div>

      {/* 9. Indemnification */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Scale className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            9. Indemnification
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            You agree to indemnify, defend, and hold harmless Surekh and our
            parent, subsidiaries, affiliates, partners, officers, directors, and
            employees from any claim or demand, including reasonable
            attorneys&apos; fees, made by any third-party due to your breach of
            these Terms of Service.
          </p>
        </div>
      </div>

      {/* 10. Governing Law */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Gavel className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            10. Governing Law
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            These Terms of Service and any separate agreements whereby we
            provide you Services shall be governed by and construed in
            accordance with the laws of India, and you irrevocably consent to
            the exclusive jurisdiction of the courts located in India for any
            disputes.
          </p>
        </div>
      </div>

      {/* 11. Changes to Terms of Service */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <RefreshCw className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            11. Changes to Terms of Service
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            You can review the most current version of the Terms of Service at
            any time on this page. We reserve the right to update or change any
            part of these Terms by posting updates to our website. Your
            continued use of the website following changes constitutes
            acceptance of those changes.
          </p>
        </div>
      </div>

      {/* 12. Contact Information */}
      <div className="rounded-2xl border border-pink-200 bg-[var(--surface)] p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            12. Contact Information
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-700 sm:text-sm">
          <p>Questions about the Terms of Service should be sent to us at:</p>
          <div className="mt-3 space-y-1.5 rounded-xl border border-pink-200/80 bg-white p-4">
            <p>
              <strong className="text-gray-900">Website:</strong>{" "}
              <a
                href="https://www.surekh.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                www.surekh.co.in
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <strong className="text-gray-900">Support Email:</strong>{" "}
              <a
                href="mailto:support@surekh.co.in"
                className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                support@surekh.co.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </LegalShell>
  );
}
