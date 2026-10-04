import Link from "next/link";

import { Sparkles } from "lucide-react";

import { SurekhLogo } from "@/components/common/SurekhLogo";

export function ComingSoonHeader() {
  return (
    <header className="relative z-20 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left: Refined Editorial Season Tag */}
          <div className="hidden flex-1 items-center sm:flex">
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#d4af37]/80 uppercase">
              AUTUMN / WINTER 2026
            </span>
          </div>

          {/* Center: Perfectly Centered Brand Mark */}
          <div className="mx-auto flex flex-shrink-0 flex-col items-center justify-center sm:mx-0">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-90"
              aria-label="Surekh Home"
            >
              <SurekhLogo
                variant="horizontal"
                theme="light"
                className="h-10 w-auto sm:h-12"
                priority
              />
            </Link>
          </div>

          {/* Right: VIP Pill */}
          <div className="hidden flex-1 items-center justify-end sm:flex">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-1 text-[11px] font-medium tracking-wider text-[#d4af37] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PRIVATE INVITATION</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
