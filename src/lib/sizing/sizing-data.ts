import type { FitProblemInfo } from "./types";

export const CUP_ORDER = ["AA", "A", "B", "C", "D", "DD", "DDD", "G", "H"];

export const VALID_BANDS = [30, 32, 34, 36, 38, 40, 42, 44, 46];

export const ALPHA_SIZE_MAPPING: Record<string, string[]> = {
  XS: ["30B", "32A", "30C"],
  S: ["32B", "34A", "30D", "32C"],
  M: ["34B", "34C", "36A", "32D"],
  L: ["36B", "36C", "38A", "34D", "36D"],
  XL: ["38B", "38C", "40B", "38D", "36DD"],
  XXL: ["40C", "40D", "42C", "38DD", "40DD"],
  "3XL": ["42D", "44C", "44D", "42DD", "46C"],
};

export const FIT_PROBLEMS: FitProblemInfo[] = [
  {
    id: "band_riding_up",
    problem: "Band Rides Up in the Back",
    symptom:
      "Your back band arches upward toward your shoulder blades instead of sitting parallel to the floor.",
    causes: [
      "The band size is too large.",
      "Shoulder straps are over-tightened to compensate for poor band support.",
    ],
    solution:
      "Step down 1 band size (e.g. from 36B to 34C). Remember 80% of breast support must come from the band, not the straps!",
  },
  {
    id: "cup_spilling",
    problem: "Spillage or 'Quad-Boob' Overflow",
    symptom:
      "Tissue overflows over the top or armpit sides of the cups, creating an uneven line under clothes.",
    causes: [
      "The cup volume is at least 1–2 sizes too small.",
      "The cup cut is too shallow for your breast projection.",
    ],
    solution:
      "Step up 1 or 2 cup sizes (e.g. from 34B to 34C or 34D) or opt for a full-coverage or balconette silhouette.",
  },
  {
    id: "cup_gaping",
    problem: "Cups Gaping or Wrinkling at Top",
    symptom:
      "There is empty space between your breasts and the upper cup edge.",
    causes: [
      "Cup size is too large.",
      "Wrong bra shape (e.g., molded cups on shallow bust).",
    ],
    solution:
      "Try stepping down 1 cup size (e.g. 34C to 34B) or try a demi-cup, plunge, or wireless stretch fabric bra.",
  },
  {
    id: "straps_slipping",
    problem: "Straps Constantly Slipping Off Shoulders",
    symptom: "You find yourself pulling up your bra straps throughout the day.",
    causes: [
      "Band is too loose, causing straps to sit too far outward on the shoulders.",
      "Straps haven't been adjusted properly.",
    ],
    solution:
      "First check your band snugness. Then adjust sliders. If you have narrow or sloping shoulders, racerback clips or cross-back bralettes work best.",
  },
  {
    id: "underwire_digging",
    problem: "Underwire Poking or Digging In",
    symptom:
      "Wires poke into your breast tissue at the underarm or dig into the ribcage.",
    causes: [
      "Cup is too small, so the wire sits directly on breast tissue.",
      "Band is too tight or wire radius doesn't match your ribcage.",
    ],
    solution:
      "Increase your cup size so the wire cradles outside the breast root. Or switch to Surekh's wirefree bamboo lounge bras for zero poke.",
  },
];
