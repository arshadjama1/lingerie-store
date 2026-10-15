// Server Component — renders the first slide as plain HTML so the LCP image
// is visible in the initial HTTP response without waiting for JS hydration.
// The full interactive carousel (autoplay, arrows, dots) is lazily mounted
// as a client island via next/dynamic after hydration.
import Image from "next/image";
import Link from "next/link";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { HeroCarouselLoader } from "./HeroCarouselLoader";

// Slide type is defined in HeroCarouselClient and shared via HeroCarouselLoader.
interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imagePosition?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: "BESTSELLER",
    title: "BAMBOO SOFT. ALL-DAY COMFORT.",
    subtitle:
      "95% Bamboo — our softest fabric ever. Wire-free bras & undies from ₹300.",
    ctaText: "SHOP BAMBOO RANGE",
    ctaLink: "/bras",
    image: "/images/home/slider-3.png",
    imagePosition: "object-[70%_top] sm:object-top",
  },
  {
    id: 2,
    badge: "NO-SHOW PACK OF 3",
    title: "SEAMLESS. INVISIBLE. EFFORTLESS.",
    subtitle:
      "Zero panty lines, zero compromise. Seamless Undie Pack of 3 at just ₹750.",
    ctaText: "SHOP SEAMLESS UNDIES",
    ctaLink: "/panties",
    image: "/images/home/slider-2.png",
    imagePosition: "object-[80%_center] sm:object-top",
  },
  {
    id: 3,
    badge: "EVERYDAY ESSENTIALS",
    title: "LIGHTWEIGHT & SOFT CAMISOLES",
    subtitle:
      "Made for everyday lounging and effortless layering. 5 versatile colours at just ₹300.",
    ctaText: "EXPLORE CAMISOLES",
    ctaLink: "/loungewear",
    image: "/images/home/slider-1.png",
    imagePosition: "object-[78%_top] sm:object-top",
  },
];

const [firstSlide] = SLIDES;

export function HeroCarousel() {
  return (
    <div className="w-full bg-white px-0 py-0">
      {/*
       * Static first-slide shell — rendered in the initial HTML payload.
       * The priority <Image> triggers an early <link rel="preload"> in <head>
       * so the browser fetches the hero image before JS even parses.
       * Once the client carousel hydrates it takes over seamlessly because
       * it starts at initialIndex=0, matching what's already on screen.
       */}
      <div className="relative h-[calc(100svh-5.5rem)] max-h-[820px] min-h-[520px] w-full overflow-hidden rounded-none border-b border-pink-100/50 bg-slate-950 shadow-lg sm:h-[calc(100svh-6rem)] sm:min-h-[580px] lg:h-[calc(100dvh-6.75rem)] lg:min-h-[640px] xl:max-h-[860px]">
        {/* Hero background image — priority so Next.js adds fetchpriority="high" */}
        <Image
          src={firstSlide.image}
          alt={firstSlide.title}
          fill
          priority
          className={cn(
            "scale-105 transform object-cover ease-out",
            firstSlide.imagePosition ?? "object-[75%_center] sm:object-top"
          )}
          sizes="100vw"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 sm:from-black/85 sm:via-black/40 sm:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent sm:hidden" />

        {/* Text content */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-white sm:px-14 lg:px-16">
          <div className="max-w-[78%] space-y-3.5 sm:max-w-xl sm:space-y-4 lg:max-w-2xl lg:space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-rose-500 px-3.5 py-1.5 text-[11px] font-black tracking-widest text-white uppercase shadow-md">
              <Sparkles className="h-3 w-3" />
              {firstSlide.badge}
            </span>

            <h1 className="font-serif text-2xl leading-tight font-black tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
              {firstSlide.title}
            </h1>

            <p className="text-xs leading-relaxed font-light text-gray-200 drop-shadow-xs sm:text-base lg:text-lg">
              {firstSlide.subtitle}
            </p>

            <div className="pt-2 sm:pt-3">
              <Link
                href={firstSlide.ctaLink}
                className="inline-flex transform items-center justify-center rounded-full bg-white px-7 py-3 text-xs font-black tracking-wider text-black uppercase shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white sm:px-8 sm:py-3.5 sm:text-sm"
              >
                {firstSlide.ctaText} →
              </Link>
            </div>
          </div>
        </div>

        {/*
         * Client carousel island — absolutely positioned over the static shell.
         * Rendered with ssr:false so it only runs in the browser. On mount it
         * starts at index 0 and immediately takes over slide rendering,
         * replacing the static content seamlessly without a visible flash.
         */}
        <div className="absolute inset-0">
          <HeroCarouselLoader slides={SLIDES} />
        </div>
      </div>
    </div>
  );
}
