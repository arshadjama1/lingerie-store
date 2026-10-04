import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

export type LogoVariant =
  | "horizontal"
  | "horizontal-clean"
  | "stacked"
  | "icon"
  | "original";

export type LogoTheme = "dark" | "light" | "gold";

export interface SurekhLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
}

const LOGO_CONFIGS: Record<
  LogoVariant,
  Record<LogoTheme, { src: string; width: number; height: number }>
> = {
  horizontal: {
    dark: {
      src: "/images/logo/surekh-horizontal.png",
      width: 561,
      height: 170,
    },
    light: {
      src: "/images/logo/surekh-horizontal-white.png",
      width: 561,
      height: 170,
    },
    gold: {
      src: "/images/logo/surekh-horizontal-white.png",
      width: 561,
      height: 170,
    },
  },
  "horizontal-clean": {
    dark: {
      src: "/images/logo/surekh-horizontal-clean.png",
      width: 479,
      height: 170,
    },
    light: {
      src: "/images/logo/surekh-horizontal-clean-white.png",
      width: 479,
      height: 170,
    },
    gold: {
      src: "/images/logo/surekh-horizontal-clean-white.png",
      width: 479,
      height: 170,
    },
  },
  stacked: {
    dark: {
      src: "/images/logo/surekh-logo-stacked.png",
      width: 710,
      height: 485,
    },
    light: {
      src: "/images/logo/surekh-logo-stacked-white.png",
      width: 710,
      height: 485,
    },
    gold: {
      src: "/images/logo/surekh-logo-stacked-white.png",
      width: 710,
      height: 485,
    },
  },
  icon: {
    dark: {
      src: "/images/logo/surekh-icon.png",
      width: 160,
      height: 300,
    },
    light: {
      src: "/images/logo/surekh-icon-white.png",
      width: 160,
      height: 300,
    },
    gold: {
      src: "/images/logo/surekh-icon-gold.png",
      width: 160,
      height: 300,
    },
  },
  original: {
    dark: {
      src: "/surekh.jpg.jpeg",
      width: 1080,
      height: 1080,
    },
    light: {
      src: "/surekh.jpg.jpeg",
      width: 1080,
      height: 1080,
    },
    gold: {
      src: "/surekh.jpg.jpeg",
      width: 1080,
      height: 1080,
    },
  },
};

export function SurekhLogo({
  variant = "horizontal",
  theme = "dark",
  className,
  width,
  height,
  priority = false,
  alt = "Surekh - Beautiful Lines Effortless Comfort",
}: SurekhLogoProps) {
  const config = LOGO_CONFIGS[variant][theme] || LOGO_CONFIGS[variant].dark;

  return (
    <Image
      src={config.src}
      alt={alt}
      width={width ?? config.width}
      height={height ?? config.height}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain transition-opacity",
        className
      )}
    />
  );
}
