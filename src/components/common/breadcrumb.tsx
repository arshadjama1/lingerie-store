import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `${process.env.NEXT_PUBLIC_APP_URL}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={cn("flex items-center py-2", className)}
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-xs">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    className="h-3 w-3 shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-wider uppercase",
                      isLast ? "text-[var(--accent-plum)]" : "text-gray-500"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[11px] font-medium tracking-wider text-gray-500 uppercase transition-colors hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
