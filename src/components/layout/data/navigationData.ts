// ── Types ─────────────────────────────────────────────────────────────
export interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
  isPopular?: boolean;
}

export interface NavCategoryHighlight {
  title: string;
  description: string;
  href: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
}

export interface NavCategoryLink {
  label: string;
  href: string;
  badge?: string;
  styles?: NavSubItem[];
  collections?: NavSubItem[];
  featured?: NavCategoryHighlight;
}

// ── Header Marquee Announcements ────────────────────────────────────
export const MARQUEE_ANNOUNCEMENTS = [
  "Tamper-Proof Hygiene Seals",
  "100% Privacy & Discreet Packaging Guaranteed",
  "Cash on Delivery Available Across India",
  "Free Shipping on Orders Above ₹1,299",
  "Bamboo Fabric — Naturally Soft & Breathable",
  "Ultra-Soft Breathable Bamboo & Cotton Knit",
  "Hassle-Free 7-Day Returns & Exchanges",
];

// ── Header Standalone Category Navigation Links with Real Products ─
export const NAV_CATEGORY_LINKS: NavCategoryLink[] = [
  {
    label: "Bras",
    href: "/bras",
    styles: [
      {
        label: "Bamboo Fabric Bra",
        href: "/p/bamboo-fabric-bra",
        badge: "Bamboo",
      },
      {
        label: "Padded Lycra Bra",
        href: "/p/padded-bra",
        badge: "Padded",
      },
      {
        label: "Mischief Lounge Bra",
        href: "/p/mischief-lounge-bra",
        badge: "Lounge",
      },
      {
        label: "Overlap Bralette Set",
        href: "/p/overlap-bralette-hipster-set",
        badge: "Bralette",
      },
    ],
    featured: {
      title: "Bamboo Fabric Bra",
      description:
        "Naturally anti-bacterial, breathable bamboo knit designed for 14-hour effortless wear.",
      href: "/p/bamboo-fabric-bra",
      badge: "Bestseller",
      imageUrl: "/images/products/bamboo-bra-black-1.png",
      ctaText: "Shop Bamboo Bra",
    },
  },
  {
    label: "Panties",
    href: "/panties",
    styles: [
      {
        label: "Seamless Undie (Pack of 3)",
        href: "/p/seamless-undie-pack-of-3",
        badge: "3-Pack",
      },
      {
        label: "Floral Undie (Pack of 3)",
        href: "/p/pack-of-3-floral-undie",
        badge: "3-Pack",
      },
      {
        label: "Bamboo Fabric Undie",
        href: "/p/bamboo-fabric-undie",
        badge: "Bamboo",
      },
      {
        label: "Boyleg Undies",
        href: "/p/boyleg",
        badge: "Boyleg",
      },
    ],
    featured: {
      title: "Seamless Undie (Pack of 3)",
      description:
        "Laser-cut raw edges eliminate panty lines under tight fits. Pack of 3 only @ ₹750.",
      href: "/p/seamless-undie-pack-of-3",
      badge: "@ ₹750 Only",
      imageUrl: "/images/products/bamboo-undie-black-1.png",
      ctaText: "Shop Pack of 3",
    },
  },
  {
    label: "Sets",
    href: "/sets",
    styles: [
      {
        label: "Luxuria Pad Lingerie Set",
        href: "/p/luxuria-pad-lingerie-set",
        badge: "Luxe Set",
      },
      {
        label: "Overlap Bralette with Hipster Set",
        href: "/p/overlap-bralette-hipster-set",
        badge: "Bralette Set",
      },
    ],
    featured: {
      title: "Luxuria Pad Lingerie Set",
      description:
        "Memory-foam light cups paired with tailored hipster undie for an immaculate silhouette.",
      href: "/p/luxuria-pad-lingerie-set",
      badge: "New Arrival",
      imageUrl: "/images/products/lingerie-set-olive-1.png",
      ctaText: "Shop Luxe Set",
    },
  },
  {
    label: "Loungewear",
    href: "/loungewear",
    styles: [
      {
        label: "Modal Comfort Camisole",
        href: "/p/camisole",
        badge: "Camisole",
      },
      {
        label: "Mischief Lounge Bra",
        href: "/p/mischief-lounge-bra",
        badge: "Loungewear",
      },
    ],
    featured: {
      title: "Modal Comfort Camisole",
      description:
        "Buttery-soft ribbed modal that layers seamlessly under blazers or serves as cozy nightwear.",
      href: "/p/camisole",
      badge: "From ₹300",
      imageUrl: "/images/products/camisole-pink-1.png",
      ctaText: "Shop Camisoles",
    },
  },
];

// ── Header Quick Offer Links ──────────────────────────────────────────
export const COMBO_QUICK_LINKS = [
  {
    label: "Seamless 3-Pack @₹750",
    href: "/p/seamless-undie-pack-of-3",
  },
  {
    label: "Floral 3-Pack @₹750",
    href: "/p/pack-of-3-floral-undie",
  },
  {
    label: "Bamboo Bras",
    href: "/p/bamboo-fabric-bra",
  },
];

// ── Footer Link Groups ────────────────────────────────────────────────
export const FOOTER_LINK_GROUPS = {
  "Shop By Category": [
    { label: "Bras", href: "/bras" },
    { label: "Panties & Undies", href: "/panties" },
    { label: "Lingerie Sets", href: "/sets" },
    { label: "Loungewear & Camisoles", href: "/loungewear" },
  ],
  "Fit & Care": [
    { label: "Bra Size Calculator & FitCode™", href: "/size-calculator" },
    { label: "Size & Measurement Guide", href: "/size-calculator" },
    { label: "Fit Troubleshooter", href: "/size-calculator" },
    { label: "Find Your Style", href: "/size-calculator" },
  ],
  "Customer Support": [
    { label: "Track Your Order", href: "/account/orders" },
    { label: "Shipping & Delivery Policy", href: "/shipping" },
    { label: "Cancellation & Return Policy", href: "/legal/returns" },
    { label: "Discreet Packaging", href: "/shipping" },
  ],
  "About Surekh": [
    { label: "Our Story & Mission", href: "/about" },
    { label: "Quality & Hygiene Guarantee", href: "/about" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
  ],
};
