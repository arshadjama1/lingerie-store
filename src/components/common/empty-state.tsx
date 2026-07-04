import Link from "next/link";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center",
        className
      )}
    >
      {/* Decorative mark — simple botanical-ish circle */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--accent-subtle)" }}
        aria-hidden="true"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <path
            d="M10 16 C10 12, 16 8, 22 12 C16 12, 10 18, 16 22 C22 18, 22 12, 16 22"
            stroke="var(--accent)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-foreground mb-2 font-serif text-xl">{title}</h3>

      {description && (
        <p className="text-foreground-muted mx-auto mb-6 max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
