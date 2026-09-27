import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { FitCalculationResult, Unit } from "@/lib/sizing/types";

export interface StoredMeasurements {
  underbust: number;
  bust: number;
  unit: Unit;
}

interface FitStoreState {
  result: FitCalculationResult | null;
  measurements: StoredMeasurements | null;
  hasCalculated: boolean;

  // Actions
  setFitResult: (
    result: FitCalculationResult,
    measurements: StoredMeasurements
  ) => void;
  clearFitResult: () => void;
}

export const useFitStore = create<FitStoreState>()(
  persist(
    (set) => ({
      result: null,
      measurements: null,
      hasCalculated: false,

      setFitResult: (result, measurements) =>
        set({
          result,
          measurements,
          hasCalculated: true,
        }),

      clearFitResult: () =>
        set({
          result: null,
          measurements: null,
          hasCalculated: false,
        }),
    }),
    {
      name: "surekh-fitcode-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
