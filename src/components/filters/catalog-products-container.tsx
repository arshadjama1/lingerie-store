"use client";

import React from "react";

import { cn } from "@/lib/utils";

import { useCatalogFilter } from "./catalog-filter-context";

interface CatalogProductsContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CatalogProductsContainer({
  children,
  className,
}: CatalogProductsContainerProps) {
  const { isPending } = useCatalogFilter();

  return (
    <div className={cn("relative", className)} aria-busy={isPending}>
      {/* Subtle luxury progress indicator during server re-render */}
      {isPending && (
        <div className="absolute -top-3 right-0 left-0 z-20 h-0.5 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-[var(--accent)]" />
        </div>
      )}

      <div
        className={cn(
          "transition-opacity duration-200",
          isPending && "pointer-events-none opacity-55 select-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
