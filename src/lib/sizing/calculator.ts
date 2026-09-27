import { ALPHA_SIZE_MAPPING, CUP_ORDER, VALID_BANDS } from "./sizing-data";
import type { FitCalculationResult, SisterSizes, Unit } from "./types";

export function convertCmToIn(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function convertInToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

/**
 * Calculates Band Size from snug underbust measurement.
 * Standard Indian intimate wear sizing method based on ribcage measurement in inches.
 */
export function calculateBandSize(underbustInches: number): number {
  if (underbustInches < 25.5) return 28;
  if (underbustInches < 27.5) return 30;
  if (underbustInches < 29.5) return 32;
  if (underbustInches < 31.5) return 34;
  if (underbustInches < 33.5) return 36;
  if (underbustInches < 35.5) return 38;
  if (underbustInches < 37.5) return 40;
  if (underbustInches < 39.5) return 42;
  if (underbustInches < 41.5) return 44;
  return 46;
}

/**
 * Calculates Cup Letter from Bust - Band difference in inches.
 */
export function calculateCupSize(diffInches: number): string {
  if (diffInches < 0.5) return "AA";
  if (diffInches < 1.5) return "A";
  if (diffInches < 2.5) return "B";
  if (diffInches < 3.5) return "C";
  if (diffInches < 4.5) return "D";
  if (diffInches < 5.5) return "DD";
  if (diffInches < 6.5) return "DDD";
  if (diffInches < 7.5) return "G";
  return "H";
}

/**
 * Maps a numeric bra size (e.g. 34B) to Surekh's standard Alpha size (XS - 3XL).
 */
export function mapToAlphaSize(band: number, cup: string): string {
  const target = `${band}${cup}`;

  for (const [alpha, sizes] of Object.entries(ALPHA_SIZE_MAPPING)) {
    if (sizes.includes(target)) {
      return alpha;
    }
  }

  // Fallback heuristic based on band size
  if (band <= 30) return "XS";
  if (band === 32) return cup === "C" || cup === "D" ? "M" : "S";
  if (band === 34) return cup === "D" || cup === "DD" ? "L" : "M";
  if (band === 36) return cup === "D" || cup === "DD" ? "XL" : "L";
  if (band === 38) return cup === "DD" || cup === "DDD" ? "XXL" : "XL";
  if (band === 40) return "XXL";
  return "3XL";
}

/**
 * Calculates Sister Sizes:
 * - One band smaller + one cup larger (snugger fit)
 * - One band larger + one cup smaller (looser, relaxed fit)
 */
export function getSisterSizes(band: number, cup: string): SisterSizes {
  const result: SisterSizes = {};
  const currentCupIdx = CUP_ORDER.indexOf(cup);
  const currentBandIdx = VALID_BANDS.indexOf(band);

  if (currentCupIdx !== -1 && currentBandIdx !== -1) {
    // Tighter band (one band down, one cup up)
    if (currentBandIdx > 0 && currentCupIdx < CUP_ORDER.length - 1) {
      const tightBand = VALID_BANDS[currentBandIdx - 1];
      const tightCup = CUP_ORDER[currentCupIdx + 1];
      result.tighterBand = {
        band: tightBand,
        cup: tightCup,
        full: `${tightBand}${tightCup}`,
      };
    }

    // Looser band (one band up, one cup down)
    if (currentBandIdx < VALID_BANDS.length - 1 && currentCupIdx > 0) {
      const looseBand = VALID_BANDS[currentBandIdx + 1];
      const looseCup = CUP_ORDER[currentCupIdx - 1];
      result.looserBand = {
        band: looseBand,
        cup: looseCup,
        full: `${looseBand}${looseCup}`,
      };
    }
  }

  return result;
}

/**
 * Main calculation entrypoint: Takes user measurements and computes complete sizing profile.
 */
export function calculateBraSize(
  underbust: number,
  bust: number,
  unit: Unit = "in"
): FitCalculationResult {
  const underbustInches =
    unit === "cm" ? convertCmToIn(underbust) : Math.round(underbust * 10) / 10;
  const bustInches =
    unit === "cm" ? convertCmToIn(bust) : Math.round(bust * 10) / 10;

  const band = calculateBandSize(underbustInches);

  // Bust measurement should logically be at least equal to underbust
  const safeBust = Math.max(bustInches, band);
  const diffInches = safeBust - band;
  const cup = calculateCupSize(diffInches);
  const fullSize = `${band}${cup}`;
  const alphaSize = mapToAlphaSize(band, cup);
  const sisterSizes = getSisterSizes(band, cup);

  // Determine styling recommendations based on size
  const recommendedBraStyles: string[] =
    cup === "A" || cup === "AA" || cup === "B"
      ? [
          "Bamboo Everyday Bra",
          "Wireless Lounge Bralette",
          "Plunge T-Shirt Bra",
        ]
      : cup === "C" || cup === "D"
        ? [
            "Seamless Comfort Bra",
            "Molded T-Shirt Bra",
            "Balconette Everyday Bra",
          ]
        : [
            "Full Coverage Support Bra",
            "Wide-Strap Comfort Bra",
            "Bamboo Wirefree Bra",
          ];

  const notes: string[] = [];
  if (sisterSizes.tighterBand) {
    notes.push(
      `If you prefer a firm athletic grip, sister size ${sisterSizes.tighterBand.full} will feel tighter.`
    );
  }
  if (sisterSizes.looserBand) {
    notes.push(
      `If you prefer relaxed lounging comfort, sister size ${sisterSizes.looserBand.full} provides a looser band.`
    );
  }

  const fitsDescription = `Your calculated size is ${fullSize} (Surekh size: ${alphaSize}). Cup difference is ${diffInches.toFixed(1)} inches.`;

  return {
    band,
    cup,
    fullSize,
    alphaSize,
    sisterSizes,
    fitsDescription,
    underbustInches,
    bustInches,
    recommendedBraStyles,
    notes,
  };
}
