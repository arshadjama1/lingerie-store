"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Eye, X } from "lucide-react";

export function TeamPreviewIndicator() {
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    // Check if the preview cookie exists
    const hasCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith("linge_preview_access=true"));
    setIsPreviewActive(hasCookie);
  }, []);

  if (!isPreviewActive) return null;

  return (
    <aside
      aria-label="Team preview controls"
      className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/90 px-3.5 py-1.5 text-xs text-white shadow-2xl backdrop-blur-md"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </span>
      <Eye className="h-3.5 w-3.5 text-amber-400" />
      <span className="font-medium text-amber-200">Team Preview Mode</span>
      <span className="text-white/40">|</span>
      <Link
        href="/?preview=exit"
        className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-white/70 underline decoration-dotted transition-colors hover:text-white"
        title="Exit preview mode and return to public Coming Soon view"
      >
        <span>Exit</span>
        <X className="h-3 w-3" />
      </Link>
    </aside>
  );
}
