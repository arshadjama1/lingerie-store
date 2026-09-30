"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

import type { NavCategoryLink } from "./data/navigationData";

interface CategoryFlyoutProps {
  category: NavCategoryLink;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick: () => void;
}

export function CategoryFlyout({
  category,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}: CategoryFlyoutProps) {
  if (!isOpen) return null;

  const { styles = [], featured } = category;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="animate-in fade-in slide-in-from-top-1.5 absolute top-full right-0 left-0 z-50 border-b border-rose-100 bg-white/98 shadow-2xl backdrop-blur-md duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Column 1: Category Styles (7 cols, 2-column grid of styles) */}
          <div className="col-span-7">
            <div className="mb-3.5 flex items-center justify-between border-b border-rose-100/70 pb-2">
              <span className="font-serif text-xs font-bold tracking-wider text-[#3d0a20] uppercase">
                {category.label} Products
              </span>
              <Link
                href={category.href}
                onClick={onItemClick}
                className="group flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline"
              >
                <span>Shop All {category.label}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-1.5">
              {styles.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className="group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-rose-50 hover:text-[var(--accent)]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-[var(--accent)] group-hover:bg-rose-100">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Featured Spotlight Card (5 cols) */}
          {featured && (
            <div className="col-span-5 border-l border-rose-100/60 pl-8">
              <div className="mb-3.5 border-b border-rose-100/70 pb-2">
                <span className="font-serif text-xs font-bold tracking-wider text-[#3d0a20] uppercase">
                  Featured Spotlight
                </span>
              </div>
              <Link
                href={featured.href}
                onClick={onItemClick}
                className="group relative flex overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/40 via-white to-pink-50/30 p-4 shadow-2xs transition-all hover:border-pink-200 hover:shadow-md"
              >
                {featured.imageUrl && (
                  <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl bg-white shadow-2xs">
                    <Image
                      src={featured.imageUrl}
                      alt={featured.title}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {featured.badge && (
                      <span className="absolute top-1.5 left-1.5 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-xs">
                        {featured.badge}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between pl-4">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)]">
                      <Sparkles className="h-3 w-3" />
                      <span>Curated Pick</span>
                    </div>
                    <h5 className="mt-1 font-serif text-sm font-bold text-neutral-900 group-hover:text-[var(--accent)]">
                      {featured.title}
                    </h5>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                      {featured.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                    <span>{featured.ctaText || "Shop Now"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
