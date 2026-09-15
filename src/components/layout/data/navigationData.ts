// ── Header Marquee Announcements ────────────────────────────────────
export const MARQUEE_ANNOUNCEMENTS = [
  "Free Returns on All Orders",
  "100% Privacy Guaranteed",
  "Cash on Delivery Available",
  "Free Shipping Above ₹999",
  "Bamboo Fabric – Softest You'll Ever Wear",
  "Discreet Packaging, Always",
  "15-Day Easy Exchange Policy",
];

// ── Header Quick Offer Links ──────────────────────────────────────────
export const COMBO_QUICK_LINKS = [
  { label: "Seamless Pack of 3 @₹750", href: "/panties" },
  { label: "Floral Pack of 3 @₹750", href: "/panties" },
  { label: "Lingerie Sets", href: "/sets" },
  { label: "Bamboo Bras", href: "/bras" },
];

// ── Header Mega Menu Structure ────────────────────────────────────────
export const NAV_MEGA_GROUPS: Record<
  string,
  { groups: { title: string; items: { label: string; href: string }[] }[] }
> = {
  Bras: {
    groups: [
      {
        title: "By Type",
        items: [
          { label: "Bamboo Fabric Bra", href: "/bras" },
          { label: "Mischief Lounge Bra", href: "/bras" },
          { label: "Overlap Bralette", href: "/sets" },
        ],
      },
      {
        title: "By Fabric",
        items: [
          { label: "Bamboo (95% Bamboo)", href: "/bras" },
          { label: "Modal (95% Modal)", href: "/bras" },
        ],
      },
      {
        title: "By Colour",
        items: [
          { label: "Black", href: "/bras" },
          { label: "Navy Blue", href: "/bras" },
          { label: "Cinder", href: "/bras" },
          { label: "Pink", href: "/bras" },
        ],
      },
    ],
  },
  Panties: {
    groups: [
      {
        title: "By Type",
        items: [
          { label: "Bamboo Fabric Undie", href: "/panties" },
          { label: "Seamless Undie Pack of 3", href: "/panties" },
          { label: "Pack of 3 Floral Undie", href: "/panties" },
        ],
      },
      {
        title: "By Fabric",
        items: [
          { label: "Bamboo", href: "/panties" },
          { label: "Modal", href: "/panties" },
          { label: "Seamless (Imported)", href: "/panties" },
        ],
      },
      {
        title: "Value Packs",
        items: [
          { label: "Floral Pack of 3 @ ₹750", href: "/panties" },
          { label: "Seamless Pack of 3 @ ₹750", href: "/panties" },
        ],
      },
    ],
  },
  Sets: {
    groups: [
      {
        title: "Lingerie Sets",
        items: [
          { label: "Overlap Bralette with Hipster", href: "/sets" },
          { label: "Luxuria Pad Lingerie Set", href: "/sets" },
        ],
      },
      {
        title: "By Colour",
        items: [
          { label: "Maroon", href: "/sets" },
          { label: "Olive", href: "/sets" },
        ],
      },
    ],
  },
  Loungewear: {
    groups: [
      {
        title: "Camisoles",
        items: [
          { label: "Black", href: "/loungewear" },
          { label: "Pink", href: "/loungewear" },
          { label: "Skin", href: "/loungewear" },
          { label: "White", href: "/loungewear" },
          { label: "Wine", href: "/loungewear" },
        ],
      },
    ],
  },
};

// ── Footer Link Groups ────────────────────────────────────────────────
export const FOOTER_LINK_GROUPS = {
  "Shop By Category": [
    { label: "Bras", href: "/bras" },
    { label: "Panties & Undies", href: "/panties" },
    { label: "Lingerie Sets", href: "/sets" },
    { label: "Loungewear & Camisoles", href: "/loungewear" },
    { label: "Nightwear", href: "/nightwear" },
    { label: "Shapewear", href: "/shapewear" },
  ],
  "Fit & Care": [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Lingerie Care Guide", href: "/care-guide" },
    { label: "Find Your Style Quiz", href: "/quiz" },
  ],
  "Customer Support": [
    { label: "Track Your Order", href: "/account/orders" },
    { label: "Shipping & Delivery Policy", href: "/shipping" },
    { label: "15-Day Easy Returns", href: "/returns" },
    { label: "Contact Customer Care", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
  ],
  "About Surekh": [
    { label: "Our Story & Mission", href: "/about" },
    { label: "Privacy & Data Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
  ],
};
