import type { Metadata } from "next";

import {
  Cookie,
  CreditCard,
  Eye,
  FileQuestion,
  Lock,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Surekh",
  description:
    "Read the official Privacy Policy of Surekh (www.surekh.co.in). Learn how we collect, use, protect, and handle your personal data and privacy rights.",
  openGraph: {
    title: "Privacy Policy | Surekh",
    description:
      "Understand how Surekh protects and respects your personal information and privacy rights.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="How Surekh collects, protects, uses, and respects your personal information."
      activeTab="privacy"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Legal", href: "/legal/privacy" },
        { label: "Privacy Policy" },
      ]}
    >
      {/* Intro Note */}
      <div className="rounded-2xl border border-pink-200/80 bg-gradient-to-br from-[#fff5f8] to-white p-6 shadow-xs">
        <p className="text-sm leading-relaxed text-gray-700">
          This Privacy Policy describes how <strong>Surekh</strong> (the
          &ldquo;Site&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) collects, uses, and discloses your personal
          information when you visit, use our services, or make a purchase from{" "}
          <a
            href="https://www.surekh.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            www.surekh.co.in
          </a>{" "}
          (the &ldquo;Site&rdquo;) or otherwise communicate with us regarding
          the Site (collectively, the &ldquo;Services&rdquo;).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          For purposes of this Privacy Policy, &ldquo;you&rdquo; and
          &ldquo;your&rdquo; means you as the user of the Services, whether you
          are a customer, website visitor, or another individual whose
          information we have collected.
        </p>
        <div className="mt-4 rounded-xl border border-pink-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-700">
            <strong>Important:</strong> Please read this Privacy Policy
            carefully. By using and accessing any of the Services, you agree to
            the collection, use, and disclosure of your information as described
            in this Privacy Policy. If you do not agree to this Privacy Policy,
            please do not use or access any of the Services.
          </p>
        </div>
      </div>

      {/* 1. Changes to This Privacy Policy */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <RefreshCw className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            1. Changes to This Privacy Policy
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes to our practices, or for operational, legal, or regulatory
            reasons. We will post the revised Privacy Policy on the Site, update
            the &ldquo;Last updated&rdquo; date, and take any other steps
            required by applicable law.
          </p>
        </div>
      </div>

      {/* 2. Information We Collect */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Eye className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            2. Information We Collect
          </h2>
        </div>
        <div className="mt-4 space-y-5 text-sm leading-relaxed text-gray-600">
          <p>
            The types of personal information we obtain about you depend on how
            you interact with our Site and use our Services.
          </p>

          {/* A. Provided Directly */}
          <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-5">
            <h3 className="font-sans text-sm font-bold text-[var(--accent-plum)]">
              A. Information You Provide Directly
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Contact Details:
                </span>
                <span>
                  Name, billing/shipping address, email address, and phone
                  number.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Order & Transaction Information:
                </span>
                <span>
                  Records of products purchased, payment confirmations, and
                  delivery notes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Account Credentials:
                </span>
                <span>
                  Username, password, and security questions (if you create an
                  account).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Customer Support Data:
                </span>
                <span>
                  Information you share when you contact us via email, chat, or
                  social media.
                </span>
              </li>
            </ul>
          </div>

          {/* B. Collected Automatically */}
          <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-5">
            <h3 className="font-sans text-sm font-bold text-[var(--accent-plum)]">
              B. Information Collected Automatically (Usage Data)
            </h3>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm">
              When you visit our Site, our servers automatically collect certain
              information about your device and interaction with the Services,
              including:
            </p>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)]">•</span>
                <span>
                  IP address, browser type, and network connection details.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)]">•</span>
                <span>
                  Pages viewed, time spent on pages, and referring URLs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)]">•</span>
                <span>
                  Information collected through cookies, pixels, web beacons,
                  and similar tracking technologies.
                </span>
              </li>
            </ul>
          </div>

          {/* C. From Third Parties */}
          <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-5">
            <h3 className="font-sans text-sm font-bold text-[var(--accent-plum)]">
              C. Information from Third Parties
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Payment Processors:
                </span>
                <span>
                  Third-party secure payment gateways collect and process your
                  financial details (such as credit/debit card numbers or UPI
                  handles) to fulfill your transactions. We do not store full
                  credit card or sensitive banking data on our servers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">
                  • Service & Marketing Partners:
                </span>
                <span>
                  Analytics providers, hosting platforms, and advertising
                  networks that help us run, secure, and market our store.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. How We Use Your Information */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Server className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            3. How We Use Your Information
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            We use your personal information for legitimate business and
            commercial purposes, including to:
          </p>
          <ul className="space-y-2.5 pl-2 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Provide and Manage Services:
              </span>
              <span>
                Process orders, handle shipping and deliveries, manage
                returns/exchanges, and maintain your account.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Communicate with You:
              </span>
              <span>
                Send order confirmations, shipping updates, customer support
                replies, and (with your consent) marketing promotions,
                newsletters, and special offers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Security and Fraud Prevention:
              </span>
              <span>
                Detect, investigate, and prevent fraudulent transactions,
                unauthorized access, or malicious activities to protect our
                business and customers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Improve Our Services:
              </span>
              <span>
                Analyze site traffic and user behavior to optimize website
                functionality, user experience, and product offerings.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Legal Compliance:
              </span>
              <span>
                Comply with applicable legal obligations, tax laws, and enforce
                our terms of service.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. How We Share and Disclose Information */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <CreditCard className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            4. How We Share and Disclose Information
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            We may share your personal information with third parties in the
            following limited circumstances:
          </p>
          <ul className="space-y-2.5 pl-2 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Service Providers:
              </span>
              <span>
                Vendors who perform services on our behalf, such as courier and
                logistics partners for shipping, payment gateways, cloud hosting
                providers, and customer support tools.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Marketing & Advertising Partners:
              </span>
              <span>
                To display relevant advertisements and promotional campaigns
                across digital platforms (subject to your cookie/privacy
                preferences).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Business Transfers:
              </span>
              <span>
                In connection with any merger, sale of company assets,
                financing, or acquisition of all or a portion of our business.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Legal Requirements:
              </span>
              <span>
                When required by law, court order, or government regulation, or
                to protect the rights, property, and safety of Surekh, our
                customers, or others.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. Cookies and Tracking Technologies */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Cookie className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            5. Cookies and Tracking Technologies
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            We use cookies to remember your preferences, keep items in your
            shopping cart, and analyze site traffic.
          </p>
          <p>
            You can choose to set your browser to remove or reject browser
            cookies. However, doing so may affect your ability to use certain
            features on our Site, such as maintaining a login session or
            completing a checkout.
          </p>
        </div>
      </div>

      {/* 6. Data Security and Retention */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Lock className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            6. Data Security and Retention
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Security:</strong> We implement reasonable administrative,
            technical, and physical security measures to safeguard your personal
            data. However, no digital transmission or storage system is 100%
            secure, and we cannot guarantee absolute security.
          </p>
          <p>
            <strong>Retention:</strong> We retain your personal information only
            as long as necessary to fulfill the purposes outlined in this
            policy, maintain your account, comply with legal obligations, and
            resolve disputes.
          </p>
        </div>
      </div>

      {/* 7. Children's Privacy */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            7. Children&apos;s Privacy
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>
            Our Services are not directed at children under the age of 18, and
            we do not knowingly collect personal information from minors. If you
            believe a child has provided us with personal data, please contact
            us immediately so we can delete it.
          </p>
        </div>
      </div>

      {/* 8. Your Rights and Choices */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <UserCheck className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            8. Your Rights and Choices
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="space-y-2 pl-2 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">• Access:</span>
              <span>
                Request a copy of the personal data we hold about you.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">• Correction:</span>
              <span>Request updates or corrections to inaccurate data.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">• Deletion:</span>
              <span>
                Request the deletion of your personal data, subject to legal
                retention obligations.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">
                • Opt-Out of Marketing:
              </span>
              <span>
                Unsubscribe from promotional emails by clicking the
                &ldquo;Unsubscribe&rdquo; link at the bottom of our emails.
              </span>
            </li>
          </ul>
          <p className="pt-2 text-xs text-gray-500">
            To exercise any of these rights, please contact us using the details
            below.
          </p>
        </div>
      </div>

      {/* 9. Contact Us */}
      <div className="rounded-2xl border border-pink-200 bg-[var(--surface)] p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
            <FileQuestion className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[var(--accent-plum)]">
            9. Contact Us
          </h2>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            If you have any questions, concerns, or complaints about this
            Privacy Policy or our data practices, please reach out to us at:
          </p>
          <div className="mt-3 space-y-1.5 rounded-xl border border-pink-200/80 bg-white p-4 text-xs sm:text-sm">
            <p>
              <strong className="text-gray-900">Brand Name:</strong> Surekh
            </p>
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
              <strong className="text-gray-900">Email Support:</strong>{" "}
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
