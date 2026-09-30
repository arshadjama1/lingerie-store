"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

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

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div className="w-full bg-white px-0 py-0">
      <div
        className="group relative h-[calc(100svh-5.5rem)] max-h-[820px] min-h-[520px] w-full overflow-hidden rounded-none border-b border-pink-100/50 bg-slate-950 shadow-lg sm:h-[calc(100svh-6rem)] sm:min-h-[580px] lg:h-[calc(100dvh-6.75rem)] lg:min-h-[640px] xl:max-h-[860px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "pointer-events-auto z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={cn(
                  "scale-105 transform object-cover transition-transform duration-10000 ease-out",
                  slide.imagePosition || "object-[75%_center] sm:object-top"
                )}
                sizes="100vw"
              />

              {/* Gradient Overlay: Left-to-right vignette for text contrast + subtle bottom vignette for indicators */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 sm:from-black/85 sm:via-black/40 sm:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent sm:hidden" />

              {/* Text Overlay Box */}
              <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-white sm:px-14 lg:px-16">
                <div className="max-w-[78%] space-y-3.5 sm:max-w-xl sm:space-y-4 lg:max-w-2xl lg:space-y-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-rose-500 px-3.5 py-1.5 text-[11px] font-black tracking-widest text-white uppercase shadow-md">
                    <Sparkles className="h-3 w-3" />
                    {slide.badge}
                  </span>

                  <h1 className="font-serif text-2xl leading-tight font-black tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>

                  <p className="text-xs leading-relaxed font-light text-gray-200 drop-shadow-xs sm:text-base lg:text-lg">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2 sm:pt-3">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex transform items-center justify-center rounded-full bg-white px-7 py-3 text-xs font-black tracking-wider text-black uppercase shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white sm:px-8 sm:py-3.5 sm:text-sm"
                    >
                      {slide.ctaText} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Prev / Next Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute top-1/2 left-4 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white hover:text-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute top-1/2 right-4 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white hover:text-black"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Floating Slide Counter & Progress Bar */}
        <div className="absolute right-6 bottom-5 z-20 hidden items-center gap-3 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 font-mono text-xs text-white backdrop-blur-md sm:flex">
          <span>0{currentIndex + 1}</span>
          <div className="h-1 w-12 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / SLIDES.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-white/60">0{SLIDES.length}</span>
        </div>

        {/* Bottom Dot Navigation */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 sm:hidden">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="flex h-10 w-10 cursor-pointer items-center justify-center p-2"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-7 bg-[var(--accent)] shadow-xs"
                    : "w-2 bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
