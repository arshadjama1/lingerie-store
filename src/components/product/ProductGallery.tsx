"use client";

import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary?: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  badge?: string | null;
  fabricTag?: string | null;
}

export function ProductGallery({
  images,
  productName,
  badge,
  fabricTag,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const safeImages =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            url: "/placeholder-img.jpg",
            alt: productName,
            isPrimary: true,
          },
        ];

  const currentImage = safeImages[activeIndex] || safeImages[0];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomCoords({ x, y });
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start">
      {/* 1. Desktop Vertical Thumbnails / Mobile Horizontal Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex scrollbar-none flex-row gap-2.5 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
          {safeImages.map((img, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "group relative aspect-[3/4] w-16 shrink-0 cursor-pointer overflow-hidden rounded-none border transition-all lg:w-20",
                  isActive
                    ? "border-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]/30"
                    : "border-gray-200 opacity-60 hover:border-gray-300 hover:opacity-100"
                )}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Viewport */}
      <div className="relative flex-1">
        <div
          ref={mainImageRef}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          className="group relative aspect-[3/4] w-full cursor-crosshair overflow-hidden rounded-none border border-gray-100 bg-[var(--surface)] shadow-sm"
        >
          {/* Main Image */}
          <Image
            src={currentImage.url}
            alt={currentImage.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-200 ease-out",
              isZooming ? "origin-center scale-150" : "scale-100"
            )}
            style={
              isZooming
                ? {
                    transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  }
                : undefined
            }
          />

          {/* Badges Overlay */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5">
            {badge && (
              <span className="inline-flex items-center gap-1 bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                <Sparkles className="h-3 w-3" />
                {badge}
              </span>
            )}
            {fabricTag && (
              <span className="inline-block bg-slate-900/85 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-xs backdrop-blur-xs">
                {fabricTag}
              </span>
            )}
          </div>

          {/* Image Counter Pill */}
          {safeImages.length > 1 && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-xs">
              {activeIndex + 1} / {safeImages.length}
            </div>
          )}

          {/* Expand / Lightbox Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/90 p-2 text-gray-700 opacity-0 shadow-md backdrop-blur-xs transition-opacity group-hover:opacity-100 hover:bg-white hover:text-black"
            aria-label="Open fullscreen image"
            title="Open fullscreen view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Desktop & Mobile Prev / Next Arrows */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-gray-800 opacity-0 shadow-md backdrop-blur-xs transition-opacity group-hover:opacity-100 hover:bg-white sm:left-4"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-gray-800 opacity-0 shadow-md backdrop-blur-xs transition-opacity group-hover:opacity-100 hover:bg-white sm:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Touch Hint Overlay */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-none bg-white/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100 sm:block">
            Hover to zoom fabric
          </div>
        </div>
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-50 cursor-pointer rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
            aria-label="Close fullscreen view"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-[85vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productName}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute top-1/2 left-6 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
