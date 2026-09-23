"use client";

import { useState } from "react";

interface ReviewBodyProps {
  body: string;
}

export function ReviewBody({ body }: ReviewBodyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = body.length > 180;

  if (!isLong) {
    return <p className="text-xs leading-relaxed text-gray-700">{body}</p>;
  }

  return (
    <div>
      <p
        className={`text-xs leading-relaxed text-gray-700 ${
          !isExpanded ? "line-clamp-3" : ""
        }`}
      >
        {body}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 cursor-pointer text-xs font-semibold text-[var(--accent)] hover:underline"
      >
        {isExpanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}
