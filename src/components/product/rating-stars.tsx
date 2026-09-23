import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 0–5, can be decimal e.g. 4.3
  count?: number; // review count; omit to hide
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
}: RatingStarsProps) {
  if (!rating || rating <= 0 || (count !== undefined && count <= 0)) {
    return null;
  }

  const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Rated ${rating.toFixed(1)} out of 5${count !== undefined ? `, ${count} reviews` : ""}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill =
            star <= Math.floor(rounded)
              ? "full"
              : star - 0.5 === rounded
                ? "half"
                : "empty";

          return (
            <svg
              key={star}
              className={cn(starSize, "shrink-0")}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              {fill === "full" && (
                <polygon
                  points="8,1 10.2,6.2 16,6.6 11.8,10.4 13.1,16 8,13 2.9,16 4.2,10.4 0,6.6 5.8,6.2"
                  fill="var(--accent)"
                />
              )}
              {fill === "half" && (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="var(--accent)" />
                      <stop offset="50%" stopColor="var(--border)" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="8,1 10.2,6.2 16,6.6 11.8,10.4 13.1,16 8,13 2.9,16 4.2,10.4 0,6.6 5.8,6.2"
                    fill={`url(#half-${star})`}
                  />
                </>
              )}
              {fill === "empty" && (
                <polygon
                  points="8,1 10.2,6.2 16,6.6 11.8,10.4 13.1,16 8,13 2.9,16 4.2,10.4 0,6.6 5.8,6.2"
                  fill="var(--border)"
                />
              )}
            </svg>
          );
        })}
      </div>

      {count !== undefined && (
        <span className="text-foreground-muted text-xs tabular-nums">
          ({count.toLocaleString("en-IN")})
        </span>
      )}
    </div>
  );
}
