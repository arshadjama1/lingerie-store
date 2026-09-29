"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
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
        className="group relative aspect-[16/7] max-h-[560px] min-h-[380px] w-full overflow-hidden rounded-none border-b border-pink-100/50 bg-slate-950 shadow-lg sm:min-h-[460px]"
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
                className="scale-105 transform object-cover object-top transition-transform duration-10000 ease-out"
                sizes="100vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

              {/* Text Overlay Box */}
              <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-white sm:px-14">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-rose-500 px-3.5 py-1.5 text-[11px] font-black tracking-widest text-white uppercase shadow-md">
                    <Sparkles className="h-3 w-3" />
                    {slide.badge}
                  </span>

                  <h1 className="font-serif text-2xl leading-tight font-black tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
                    {slide.title}
                  </h1>

                  <p className="text-xs leading-relaxed font-light text-gray-200 drop-shadow-xs sm:text-base">
                    {slide.subtitle}
                  </p>

                  <div className="pt-3">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex transform items-center justify-center rounded-full bg-white px-8 py-3.5 text-xs font-black tracking-wider text-black uppercase shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-white sm:text-sm"
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
