"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const failSafeRef = useRef<NodeJS.Timeout | null>(null);
  const activeNavRef = useRef(false);

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (failSafeRef.current) clearTimeout(failSafeRef.current);

    activeNavRef.current = true;
    setIsFinishing(false);
    setIsVisible(true);
    setProgress(15);

    // Progressive easing steps
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) return prev + 12;
        if (prev < 70) return prev + 6;
        if (prev < 85) return prev + 1.5;
        if (prev < 93) return prev + 0.5;
        return prev;
      });
    }, 120);

    // Fail-safe cleanup after 8 seconds in case navigation is cancelled
    failSafeRef.current = setTimeout(() => {
      completeProgress();
    }, 8000);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (failSafeRef.current) clearTimeout(failSafeRef.current);

    if (!activeNavRef.current && !isVisible) return;

    setProgress(100);
    setIsFinishing(true);

    setTimeout(() => {
      setIsVisible(false);
      setIsFinishing(false);
      setProgress(0);
      activeNavRef.current = false;
    }, 220);
  };

  // Complete progress whenever route path or search params change
  useEffect(() => {
    if (activeNavRef.current) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks and popstate events
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, new window)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, downloads, hash links, mailto, tel
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      // Check URL origin
      try {
        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;

        // Ignore same page without search param change
        const isSamePath =
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search;
        if (isSamePath) return;

        // Valid internal navigation
        startProgress();
      } catch {
        // invalid URL string, ignore
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearInterval(timerRef.current);
      if (failSafeRef.current) clearTimeout(failSafeRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-[2.5px] w-full"
    >
      <div
        className="h-full transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: isFinishing ? "180ms" : "250ms",
          opacity: isFinishing ? 0 : 1,
          backgroundColor: "var(--accent, #c83c7e)",
          boxShadow:
            "0 0 8px rgba(200, 60, 126, 0.7), 0 0 3px rgba(200, 60, 126, 0.5)",
        }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
