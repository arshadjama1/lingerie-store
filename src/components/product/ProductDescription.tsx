import React from "react";

interface ProductDescriptionProps {
  description: string | null;
}

/**
 * Helper to parse inline markdown (e.g. **bold**)
 */
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-bold text-gray-900">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) {
    return (
      <p className="text-sm leading-relaxed text-gray-700">
        Designed for all-day skin comfort with premium breathable fabric, shape
        retention, and precision support.
      </p>
    );
  }

  // Split description by blank lines to get blocks
  const blocks = description
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5 text-xs leading-relaxed text-gray-700 sm:text-sm">
      {blocks.map((block, idx) => {
        // H1 header (# Title)
        if (block.startsWith("# ")) {
          const title = block.replace(/^#\s+/, "");
          return (
            <h3
              key={idx}
              className="border-b border-pink-100/60 pb-2 font-serif text-lg font-bold tracking-tight text-[var(--accent-plum)] uppercase sm:text-xl"
            >
              {parseInline(title)}
            </h3>
          );
        }

        // H3 header (### Subtitle)
        if (block.startsWith("### ")) {
          const subtitle = block.replace(/^###\s+/, "");
          return (
            <h4
              key={idx}
              className="pt-2 text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase sm:text-sm"
            >
              {parseInline(subtitle)}
            </h4>
          );
        }

        // Bullet lists (* item)
        if (block.includes("\n* ") || block.startsWith("* ")) {
          const lines = block
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.startsWith("* "));
          return (
            <ul key={idx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => {
                const itemContent = line.replace(/^\*\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{parseInline(itemContent)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="leading-relaxed font-light text-gray-700">
            {parseInline(block)}
          </p>
        );
      })}
    </div>
  );
}
