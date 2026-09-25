import Link from "next/link";

import {
  ArrowRight,
  Lock,
  Mail,
  PhoneCall,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { FOOTER_LINK_GROUPS } from "./data/navigationData";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-pink-900/60 bg-[#11040b] text-white">
      {/* Newsletter Strip */}
      <div className="border-b border-pink-800/50 bg-[#240819] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl font-black tracking-tight text-white sm:text-2xl">
              Join the Surekh Insider Club
            </h3>
            <p className="text-xs font-normal text-pink-100">
              Get secret sale updates, exclusive coupon codes, and fit tips
              delivered to your inbox.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center gap-0 shadow-xl md:w-auto">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-none bg-white py-3.5 pr-4 pl-10 text-xs font-semibold text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
              />
              <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <button className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-none bg-[var(--accent)] px-7 py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-colors hover:bg-pink-600">
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4 sm:col-span-4 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-1 font-serif text-2xl font-black tracking-widest text-white"
            >
              <span>Surekh</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            </Link>
            <p className="text-xs leading-relaxed font-normal text-pink-100/90">
              India&apos;s premier intimate wear destination designed for every
              woman&apos;s unique comfort, fit precision, and signature style.
            </p>
            <div className="flex items-center gap-2 rounded-none border border-white/15 bg-white/10 p-2.5 text-xs font-bold text-white">
              <PhoneCall className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
              <span>Support: +91 1800-123-4567</span>
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(FOOTER_LINK_GROUPS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 border-b border-pink-700/60 pb-2 text-xs font-black tracking-widest text-white uppercase">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs font-medium text-pink-100/90 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Trust & Copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-pink-900/60 pt-8 text-xs font-medium text-pink-200/90 sm:flex-row">
          <div className="flex flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
            <p>
              © {new Date().getFullYear()} Surekh Retail Pvt Ltd. All rights
              reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-pink-300/80 sm:justify-start">
              <Link
                href="/about"
                className="transition-colors hover:text-white hover:underline"
              >
                About Us
              </Link>
              <span>•</span>
              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-white hover:underline"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/legal/terms"
                className="transition-colors hover:text-white hover:underline"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                href="/legal/returns"
                className="transition-colors hover:text-white hover:underline"
              >
                Return & Exchange Policy
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> 256-Bit SSL
              Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-sky-400" /> Discreet Packaging
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-pink-400" /> Guaranteed
              Fit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
