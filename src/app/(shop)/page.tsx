import { getCatalogFeatured } from "@/modules/catalog";

import { BrandStorySection } from "@/components/home/BrandStorySection";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ComboDealsStrip } from "@/components/home/ComboDealsStrip";
import { CuratedSpotlightBanners } from "@/components/home/CuratedSpotlightBanners";
import { FitCodeCalculatorBanner } from "@/components/home/FitCodeCalculatorBanner";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HomeShowcase } from "@/components/home/HomeShowcase";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";

export const revalidate = 600;

export default async function HomePage() {
  const featuredProducts = await getCatalogFeatured(12).catch(() => []);

  return (
    <div className="flex flex-col gap-0 bg-white pb-16">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Super Saver Combo Deals Strip */}
      <ComboDealsStrip />

      {/* 3. Category Avatar Bar */}
      <div className="pt-4">
        <CategoryTiles />
      </div>

      {/* 4. Master Home Feature Showcase (Playful 2x2, Ribbon Edits, Comfort Slider, Occasion Cards, Fabric Cards, Style Cutouts, Bestsellers Grid) */}
      <HomeShowcase products={featuredProducts} />

      {/* 5. Curated Spotlight Banners */}
      <CuratedSpotlightBanners />

      {/* 6. FitCode™ Bra Size Finder Banner */}
      <FitCodeCalculatorBanner />

      {/* 7. Brand Story & Stats */}
      <BrandStorySection />

      {/* 8. Customer Testimonials */}
      <TestimonialsSection />

      {/* 9. Storefront Trust Strip */}
      <TrustStrip />
    </div>
  );
}
