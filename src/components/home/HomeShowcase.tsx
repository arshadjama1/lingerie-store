"use client";

import { BestsellerShowcase } from "./BestsellerShowcase";
import type { ProductItem } from "./BestsellerShowcase";
import { ComfortFoliageSection } from "./ComfortFoliageSection";
import { FloralFabricGrid } from "./FloralFabricGrid";
import { PlayfulCategoryGrid } from "./PlayfulCategoryGrid";
import { RibbonEditsGrid } from "./RibbonEditsGrid";
import { StyleCutoutsGrid } from "./StyleCutoutsGrid";
import { TimeOccasionGrid } from "./TimeOccasionGrid";

export function HomeShowcase({ products }: { products: ProductItem[] }) {
  return (
    <div className="space-y-16">
      {/* 1. Playful 2x2 Category Grid */}
      <PlayfulCategoryGrid />

      {/* 2. Slanted Ribbon Edit Cards */}
      <RibbonEditsGrid />

      {/* 3. Nature & Comfort Edit Slider */}
      <ComfortFoliageSection />

      {/* 4. Time of Day Occasion Cards */}
      <TimeOccasionGrid />

      {/* 5. Everyday Fabric Floral Cards */}
      <FloralFabricGrid />

      {/* 6. Style Silhouette Cutout Cards */}
      <StyleCutoutsGrid />

      {/* 7. Tabbed Bestseller Showcase Grid */}
      <BestsellerShowcase products={products} />
    </div>
  );
}
