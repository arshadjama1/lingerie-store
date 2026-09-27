export type Unit = "in" | "cm";

export interface BraSize {
  band: number;
  cup: string;
  full: string;
}

export interface SisterSizes {
  tighterBand?: BraSize;
  looserBand?: BraSize;
}

export interface FitCalculationResult {
  band: number;
  cup: string;
  fullSize: string;
  alphaSize: string;
  sisterSizes: SisterSizes;
  fitsDescription: string;
  underbustInches: number;
  bustInches: number;
  recommendedBraStyles: string[];
  notes?: string[];
}

export interface FitProblemInfo {
  id: string;
  problem: string;
  symptom: string;
  causes: string[];
  solution: string;
}
