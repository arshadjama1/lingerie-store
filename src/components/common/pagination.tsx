import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Function that returns the URL for a given page number */
  buildUrl: (page: number) => string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-none border border-gray-200 opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, i) =>
        page === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-xs font-bold text-gray-400"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page as number)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-none border text-xs font-black shadow-xs transition-all",
              page === currentPage
                ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-800 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-none border border-gray-200 opacity-40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);

  return pages;
}
