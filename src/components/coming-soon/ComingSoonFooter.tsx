import { Mail, MessageCircle } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ComingSoonFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-white/10 bg-black/40 py-10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand & Mission */}
          <div className="text-center md:text-left">
            <div className="font-serif text-xl font-bold tracking-[0.2em] text-white">
              Surekh<span className="text-[#c83c7e]">.</span>
            </div>
            <p className="mt-1 max-w-sm text-xs text-rose-200/60">
              Sculpted intimacy, French laces, and certified mulberry silks.
              Designed in Paris, perfected for you.
            </p>
          </div>

          {/* Concierge & Socials */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-rose-100/70">
            <a
              href="mailto:concierge@surekh.luxury"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-[#d4af37]/50 hover:text-[#d4af37]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>concierge@surekh.luxury</span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-[#d4af37]/50 hover:text-[#d4af37]"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              <span>@surekh.intimates</span>
            </a>

            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition-colors hover:border-[#d4af37]/50 hover:text-[#d4af37]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>VIP Concierge</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-6 text-[11px] text-rose-200/40 sm:flex-row">
          <span>
            © 2026 Surekh. All rights reserved. Discreet packaging guaranteed.
          </span>
          <span>Confidentiality & Privacy First</span>
        </div>
      </div>
    </footer>
  );
}
