import { HeartHandshake, Package, Scissors, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    icon: Scissors,
    title: "FitCode™ Precision",
    description:
      "Every silhouette is engineered with our proprietary ergonomic sizing matrix, eliminating band dig and shoulder strain.",
  },
  {
    icon: ShieldCheck,
    title: "Artisanal Silk & Modal",
    description:
      "Hand-selected 6A mulberry silks, delicate eyelash lace, and ultra-breathable hypoallergenic linings designed for all-day comfort.",
  },
  {
    icon: Package,
    title: "Discreet Luxury Unboxing",
    description:
      "Each order arrives in a fragrance-infused, unmarked matte keepsake box ensuring utmost privacy and celebratory elegance.",
  },
  {
    icon: HeartHandshake,
    title: "Complimentary Fit Concierge",
    description:
      "Enjoy complimentary one-on-one virtual fitting guidance with our intimate apparel specialists before you order.",
  },
];

export function BrandPillars() {
  return (
    <section className="relative mx-auto w-full max-w-7xl border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/40 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4af37]/30 bg-gradient-to-br from-[#c83c7e]/20 to-[#d4af37]/20 text-[#d4af37]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-white">
                {pillar.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-rose-100/70">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
