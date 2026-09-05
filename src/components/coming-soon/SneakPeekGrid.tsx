import Image from "next/image";

import { Sparkles } from "lucide-react";

interface CollectionItem {
  id: string;
  number: string;
  title: string;
  categoryLabel: string;
  editionBadge: string;
  material: string;
  sensoryNote: string;
  description: string;
  image: string;
  colors: { name: string; hex: string }[];
  sizeRange: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: "silk-atelier",
    number: "01",
    title: "The Silk Sanctuary",
    categoryLabel: "SILK & LOUNGEWEAR",
    editionBadge: "LIMITED ATELIER",
    material: "100% Grade-6A Mulberry Silk (22 Momme)",
    sensoryNote: "Weightless Drape & Thermal Regulating",
    description:
      "Cut on the bias for fluid movement that cascades over curves. French-seamed with hypoallergenic softness.",
    image: "/images/home/cat_nightwear.jpg",
    colors: [
      { name: "Champagne Pearl", hex: "#f5e6d3" },
      { name: "Midnight Plum", hex: "#3d0a20" },
      { name: "Noir Velours", hex: "#111111" },
    ],
    sizeRange: "XS — 2XL (Inclusive Cut)",
  },
  {
    id: "second-skin-bare",
    number: "02",
    title: "Second-Skin Bare",
    categoryLabel: "EVERYDAY WIREFREE",
    editionBadge: "SIGNATURE FIT",
    material: "Cloud-Touch Micro-Modal & Feather Foam",
    sensoryNote: "Zero-Pressure Support",
    description:
      "Eliminates underwire poking with our adaptive 3D-gel cradle that molds to your ribcage with breathability.",
    image: "/images/home/cat_bras.jpg",
    colors: [
      { name: "Bare Nude", hex: "#e2b89d" },
      { name: "Blush Rose", hex: "#e8a5b8" },
      { name: "Obsidian", hex: "#181818" },
    ],
    sizeRange: "30B — 40G (32 FitCode Contours)",
  },
  {
    id: "midnight-chantilly",
    number: "03",
    title: "Midnight Chantilly",
    categoryLabel: "COUTURE LACE",
    editionBadge: "EXCLUSIVE RUNWAY",
    material: "Calais-Style Eyelash Floral Lace",
    sensoryNote: "Ultra-Soft Scalloped Touch",
    description:
      "Intricately woven eyelash lace bralettes celebrating unapologetic sensuality, sheer panelling, and gilded hardware.",
    image: "/images/home/hero_slide_2.jpg",
    colors: [
      { name: "Midnight Onyx", hex: "#0f0f14" },
      { name: "Crimson Allure", hex: "#7a0c2e" },
      { name: "Gilded White", hex: "#faf6f0" },
    ],
    sizeRange: "XS — XL (Adjustable Back Bands)",
  },
  {
    id: "sculpted-silhouette",
    number: "04",
    title: "Sculpted Silhouette",
    categoryLabel: "CONTOUR & SHAPEWEAR",
    editionBadge: "CORE INNOVATION",
    material: "High-Recovery Bonded Micro-Knit",
    sensoryNote: "Targeted Breathable Smoothing",
    description:
      "Seamless targeted compression that contours the waist and supports the lower back without squeezing your breath away.",
    image: "/images/home/cat_shapewear.jpg",
    colors: [
      { name: "Sienna Contour", hex: "#8c533e" },
      { name: "Warm Honey", hex: "#cfa584" },
      { name: "Jet Black", hex: "#101010" },
    ],
    sizeRange: "XS — 3XL (Non-Rolling Hem)",
  },
  {
    id: "velvet-whisper-briefs",
    number: "05",
    title: "Velvet Whisper Panties",
    categoryLabel: "SILK & COTTON BRIEFS",
    editionBadge: "EVERYDAY LUXURY",
    material: "Italian Stretch Silk & Organic Cotton",
    sensoryNote: "100% Cotton Breathable Gusset",
    description:
      "Ultra-soft hipsters and high-cut briefs designed with flat laser-cut edges that stay 100% invisible under sheer slip dresses.",
    image: "/images/home/cat_panties.jpg",
    colors: [
      { name: "Rose Quartz", hex: "#e0a6b5" },
      { name: "Opaline Cream", hex: "#f3ede3" },
      { name: "Eclipse Black", hex: "#1a1a1a" },
    ],
    sizeRange: "XS — 2XL (High & Low Rise)",
  },
  {
    id: "active-contour-set",
    number: "06",
    title: "Aura Contour Movement",
    categoryLabel: "LOUNGE & CONTOUR",
    editionBadge: "LIMITED RELEASE",
    material: "Ribbed Butter-Touch Nylon Elastane",
    sensoryNote: "Sweat-Wicking Second-Skin",
    description:
      "Minimalist ribbed lounge sets and contour bodysuits that transition seamlessly from private mornings to evening layering.",
    image: "/images/home/cat_activewear.jpg",
    colors: [
      { name: "Espresso", hex: "#3b261f" },
      { name: "Vintage Rose", hex: "#b87082" },
      { name: "Stone Grey", hex: "#63605e" },
    ],
    sizeRange: "XS — XL (4-Way Stretch)",
  },
];

export function SneakPeekGrid() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* ── Section Title & Curator Note ──────────────────────────── */}
      <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-1 text-[11px] font-semibold tracking-[0.25em] text-[#d4af37] uppercase shadow-[0_0_20px_rgba(212,175,55,0.12)] backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          THE INAUGURAL VAULT
        </div>

        <h2 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
          Curated Debut Collections
        </h2>

        <p className="mt-3 text-sm leading-relaxed font-light text-rose-100/75 sm:text-base">
          Six distinct silhouettes meticulously developed over 18 months.
          Explore our curated preview of the upcoming inaugural drop.
        </p>
      </div>

      {/* ── Visual Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {COLLECTIONS.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d4af37]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            {/* Image Container with high-fashion hover zoom */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover contrast-[1.08] filter transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Multilayered Luxury Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 opacity-80 transition-opacity duration-500 group-hover:opacity-65" />

              {/* Top Badge Strip: Look Number & Edition */}
              <div className="absolute inset-x-3.5 top-3.5 z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-black/70 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#d4af37] backdrop-blur-md">
                  LOOK {item.number}
                </span>

                <span className="inline-block rounded-md border border-[#c83c7e]/40 bg-[#3d0a20]/80 px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-rose-200 uppercase backdrop-blur-md">
                  {item.editionBadge}
                </span>
              </div>

              {/* Bottom Overlay Info */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                {/* Category label */}
                <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#d4af37] uppercase">
                  <span>{item.categoryLabel}</span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl leading-tight font-bold text-white transition-colors group-hover:text-[#d4af37]">
                  {item.title}
                </h3>

                {/* Material summary */}
                <p className="mt-1.5 line-clamp-1 text-xs font-medium text-rose-200/80">
                  {item.material}
                </p>

                {/* Description */}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-light text-rose-100/60">
                  {item.description}
                </p>

                {/* Colorway swatches & Size summary */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                  {/* Color Swatch Dots */}
                  <div className="flex items-center gap-1.5">
                    {item.colors.map((c, i) => (
                      <span
                        key={i}
                        title={c.name}
                        className="h-3 w-3 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    <span className="ml-1 text-[10px] tracking-wider text-rose-200/50 uppercase">
                      {item.colors.length} shades
                    </span>
                  </div>

                  {/* Size pill */}
                  <span className="font-mono text-[11px] text-rose-200/80">
                    {item.sizeRange.split("(")[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
