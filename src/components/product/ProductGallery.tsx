"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
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
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);
  const [lightboxZoomCoords, setLightboxZoomCoords] = useState({
    x: 50,
    y: 50,
  });
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const lightboxTouchStartX = useRef<number | null>(null);
  const lightboxTouchStartY = useRef<number | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lightboxThumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Keep activeIndex within bounds when images change (e.g. variant switched)
  useEffect(() => {
    setActiveIndex((prev) => (prev >= safeImages.length ? 0 : prev));
  }, [safeImages.length]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Smoothly scroll active thumbnail into view
  useEffect(() => {
    const activeThumb = thumbnailRefs.current[activeIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (lightboxOpen) {
      const activeLightboxThumb = lightboxThumbnailRefs.current[activeIndex];
      if (activeLightboxThumb) {
        activeLightboxThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeIndex, lightboxOpen]);

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
    setIsZooming(false);
    setIsLightboxZoomed(false);
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setIsZooming(false);
    setIsLightboxZoomed(false);
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  // Touch swipe support on main viewport
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isSwiping.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      const diffY =
        touchStartY.current !== null
          ? touchStartY.current - e.changedTouches[0].clientY
          : 0;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        isSwiping.current = true;
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [handleNext, handlePrev]
  );

  const handleMainImageClick = () => {
    if (isSwiping.current) {
      isSwiping.current = false;
      return;
    }
    setLightboxOpen(true);
  };

  // Lightbox keyboard & scroll-lock management
  useEffect(() => {
    if (!lightboxOpen) return;
    lockScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, handlePrev, handleNext]);

  // Native browser fullscreen toggle
  const toggleBrowserFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenMode(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreenMode(false);
      }
    } catch {
      // Browser permissions or mobile browsers without Fullscreen API
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleCloseLightbox = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsLightboxZoomed(false);
    setLightboxOpen(false);
  }, []);

  // Lightbox touch swipe handlers
  const handleLightboxTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isLightboxZoomed) return;
      lightboxTouchStartX.current = e.touches[0].clientX;
      lightboxTouchStartY.current = e.touches[0].clientY;
    },
    [isLightboxZoomed]
  );

  const handleLightboxTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isLightboxZoomed || lightboxTouchStartX.current === null) return;
      const diffX = lightboxTouchStartX.current - e.changedTouches[0].clientX;
      const diffY =
        lightboxTouchStartY.current !== null
          ? lightboxTouchStartY.current - e.changedTouches[0].clientY
          : 0;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      lightboxTouchStartX.current = null;
      lightboxTouchStartY.current = null;
    },
    [isLightboxZoomed, handleNext, handlePrev]
  );

  // Lightbox zoom pan handler
  const handleLightboxMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isLightboxZoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );
      setLightboxZoomCoords({ x, y });
    },
    [isLightboxZoomed]
  );

  const toggleLightboxZoom = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLightboxZoomed((prev) => !prev);
  }, []);

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
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => {
                  setIsZooming(false);
                  setActiveIndex(idx);
                }}
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
                {img.url.includes("size_chart") && (
                  <span className="absolute inset-x-0 bottom-0 bg-stone-900/85 py-0.5 text-center text-[7.5px] font-bold tracking-wider text-white uppercase backdrop-blur-xs">
                    Size Chart
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Viewport */}
      <div className="relative flex-1">
        <div
          ref={mainImageRef}
          onClick={handleMainImageClick}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="group relative aspect-[3/4] w-full cursor-zoom-in touch-pan-y overflow-hidden rounded-none border border-gray-100 bg-[var(--surface)] shadow-sm"
          title="Click to view full screen"
        >
          {/* Main Slider Track with Smooth Slide-In Transition */}
          <div
            className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {safeImages.map((img, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={img.id}
                  aria-hidden={!isActive}
                  className="relative h-full w-full shrink-0"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${productName} - View ${idx + 1}`}
                    fill
                    priority={idx === 0 || isActive}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={cn(
                      "object-cover transition-transform duration-200 ease-out",
                      isZooming && isActive ? "scale-150" : "scale-100"
                    )}
                    style={
                      isZooming && isActive
                        ? {
                            transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                          }
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>

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

          {/* Mobile Indicator Dots */}
          {safeImages.length > 1 && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:hidden">
              {safeImages.map((img, idx) => (
                <span
                  key={img.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === idx
                      ? "w-4 bg-[var(--accent)]"
                      : "w-1.5 bg-white/70 shadow-xs"
                  )}
                />
              ))}
            </div>
          )}

          {/* Expand / Lightbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-gray-800 shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:bg-white hover:text-black focus:ring-2 focus:ring-[var(--accent)] focus:outline-hidden"
            aria-label="Open fullscreen image gallery"
            title="Open fullscreen view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Desktop & Mobile Prev / Next Arrows */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-gray-800 opacity-90 shadow-md backdrop-blur-xs transition-opacity hover:bg-white sm:left-4 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-gray-800 opacity-90 shadow-md backdrop-blur-xs transition-opacity hover:bg-white sm:right-4 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Touch Hint Overlay */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-none bg-white/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100 sm:block">
            Click to expand • Hover to zoom
          </div>
        </div>
      </div>

      {/* 3. Fullscreen Lightbox Modal (Portaled to body) */}
      {lightboxOpen &&
        isMounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen product image gallery"
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-md select-none"
            onClick={handleCloseLightbox}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Lightbox Header Bar */}
            <div
              className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Title / Counter */}
              <div className="flex items-center gap-3">
                <span className="max-w-[200px] truncate text-xs font-bold text-white sm:max-w-md sm:text-sm">
                  {currentImage.url.includes("size_chart")
                    ? `${productName} — Size Chart`
                    : productName}
                </span>
                {safeImages.length > 1 && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white/90">
                    {activeIndex + 1} / {safeImages.length}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Zoom In / Out Toggle */}
                <button
                  type="button"
                  onClick={toggleLightboxZoom}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                  aria-label={isLightboxZoomed ? "Zoom out" : "Zoom in"}
                  title={
                    isLightboxZoomed
                      ? "Zoom out (1x)"
                      : "Zoom in to inspect details"
                  }
                >
                  {isLightboxZoomed ? (
                    <ZoomOut className="h-4 w-4" />
                  ) : (
                    <ZoomIn className="h-4 w-4" />
                  )}
                </button>

                {/* Native Browser Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBrowserFullscreen();
                  }}
                  className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 sm:flex"
                  aria-label={
                    isFullscreenMode ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  title={
                    isFullscreenMode ? "Exit fullscreen" : "Enter fullscreen"
                  }
                >
                  {isFullscreenMode ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseLightbox();
                  }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95"
                  aria-label="Close fullscreen view"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Central Main Viewport */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6">
              {/* Prev Arrow */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute top-1/2 left-3 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30 active:scale-95 sm:left-6 sm:h-12 sm:w-12"
                  aria-label="Previous image"
                  title="Previous image (←)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Main Image Container with Smooth Slide-In Transition */}
              <div
                className={cn(
                  "relative max-h-full max-w-full touch-pan-y overflow-hidden transition-all duration-200",
                  isLightboxZoomed
                    ? "h-full w-full cursor-zoom-out"
                    : "aspect-[3/4] h-[75vh] max-h-[85vh] cursor-zoom-in sm:h-[80vh]"
                )}
                onClick={toggleLightboxZoom}
                onMouseMove={handleLightboxMouseMove}
              >
                <div
                  className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {safeImages.map((img, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <div
                        key={img.id}
                        aria-hidden={!isActive}
                        className="relative flex h-full w-full shrink-0 items-center justify-center"
                      >
                        <Image
                          src={img.url}
                          alt={img.alt || `${productName} - View ${idx + 1}`}
                          fill
                          priority={idx === 0 || isActive}
                          className={cn(
                            "object-contain transition-transform duration-200 ease-out select-none",
                            isLightboxZoomed && isActive
                              ? "scale-[2.2]"
                              : "scale-100"
                          )}
                          style={
                            isLightboxZoomed && isActive
                              ? {
                                  transformOrigin: `${lightboxZoomCoords.x}% ${lightboxZoomCoords.y}%`,
                                }
                              : undefined
                          }
                          sizes="100vw"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Arrow */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute top-1/2 right-3 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30 active:scale-95 sm:right-6 sm:h-12 sm:w-12"
                  aria-label="Next image"
                  title="Next image (→)"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {safeImages.length > 1 && (
              <div
                className="relative z-20 border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto flex max-w-fit items-center justify-center gap-2 overflow-x-auto py-0.5">
                  {safeImages.map((img, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={img.id}
                        ref={(el) => {
                          lightboxThumbnailRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLightboxZoomed(false);
                          setActiveIndex(idx);
                        }}
                        className={cn(
                          "relative aspect-[3/4] h-12 w-9 shrink-0 cursor-pointer overflow-hidden border transition-all sm:h-14 sm:w-11",
                          isActive
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                            : "border-white/20 opacity-50 hover:border-white/60 hover:opacity-100"
                        )}
                        aria-label={`Jump to image ${idx + 1}`}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
