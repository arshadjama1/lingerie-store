"use client";

// This thin client shim exists solely to host the next/dynamic call with
// ssr: false. Next.js 16 does not allow dynamic({ ssr: false }) in Server
// Components — the call must live inside a "use client" boundary.
//
// HeroCarousel.tsx (Server Component) renders the first slide statically,
// then mounts this loader which lazily downloads the full interactive
// carousel (HeroCarouselClient) after hydration.
import dynamic from "next/dynamic";

import type { Slide } from "./HeroCarouselClient";

const HeroCarouselClient = dynamic(
  () =>
    import("./HeroCarouselClient").then((m) => ({
      default: m.HeroCarouselClient,
    })),
  { ssr: false }
);

interface HeroCarouselLoaderProps {
  slides: Slide[];
}

export function HeroCarouselLoader({ slides }: HeroCarouselLoaderProps) {
  return <HeroCarouselClient slides={slides} initialIndex={0} />;
}
