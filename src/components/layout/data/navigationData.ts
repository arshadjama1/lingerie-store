// ── Header Marquee Announcements ────────────────────────────────────
export const MARQUEE_ANNOUNCEMENTS = [
  "Free Returns on All Orders",
  "100% Privacy Guaranteed",
  "Cash on Delivery Available",
  "Free Shipping Above ₹999",
  "5 Lakh+ Happy Customers",
  "Discreet Packaging, Always",
  "15-Day Easy Exchange Policy",
];

// ── Header Quick Offer Links ──────────────────────────────────────────
export const COMBO_QUICK_LINKS = [
  { label: "4 Bras @₹899", href: "/sale" },
  { label: "3 Bras @₹1099", href: "/sale" },
  { label: "4 Panties @₹599", href: "/sale" },
  { label: "Lingerie Sets", href: "/lingerie-sets" },
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
          { label: "T-Shirt Bra", href: "/bras" },
          { label: "Push-Up Bra", href: "/bras" },
          { label: "Sports Bra", href: "/bras" },
          { label: "Bralette", href: "/bras" },
          { label: "Strapless", href: "/bras" },
          { label: "Backless Bra", href: "/bras" },
          { label: "Full Figure", href: "/bras" },
        ],
      },
      {
        title: "By Padding",
        items: [
          { label: "Non-Padded", href: "/bras" },
          { label: "Padded", href: "/bras" },
          { label: "Lightly Padded", href: "/bras" },
          { label: "Non-Wire", href: "/bras" },
          { label: "Underwire", href: "/bras" },
        ],
      },
      {
        title: "By Fabric",
        items: [
          { label: "Cotton", href: "/bras" },
          { label: "Lace", href: "/bras" },
          { label: "Seamless", href: "/bras" },
          { label: "Satin", href: "/bras" },
        ],
      },
      {
        title: "Special Offers",
        items: [
          { label: "4 Bras @ ₹899", href: "/sale" },
          { label: "3 Bras @ ₹1099", href: "/sale" },
          { label: "2 Bras @ ₹1199", href: "/sale" },
        ],
      },
    ],
  },
  Panties: {
    groups: [
      {
        title: "By Type",
        items: [
          { label: "Hipsters", href: "/panties" },
          { label: "Bikini", href: "/panties" },
          { label: "Thongs", href: "/panties" },
          { label: "Boyshorts", href: "/panties" },
          { label: "High Waist", href: "/panties" },
          { label: "Low Waist", href: "/panties" },
        ],
      },
      {
        title: "By Fabric",
        items: [
          { label: "Cotton", href: "/panties" },
          { label: "Lace", href: "/panties" },
          { label: "Modal", href: "/panties" },
          { label: "Seamless", href: "/panties" },
        ],
      },
      {
        title: "Solution",
        items: [
          { label: "Bridal", href: "/panties" },
          { label: "Maternity", href: "/panties" },
          { label: "Tummy Tucker", href: "/panties" },
        ],
      },
      {
        title: "Special Offers",
        items: [
          { label: "4 Panties @ ₹599", href: "/sale" },
          { label: "3 Panties @ ₹599", href: "/sale" },
          { label: "3 Panties @ ₹999", href: "/sale" },
        ],
      },
    ],
  },
  Nightwear: {
    groups: [
      {
        title: "By Type",
        items: [
          { label: "Night Suits", href: "/nightwear" },
          { label: "Nighties", href: "/nightwear" },
          { label: "Babydolls", href: "/nightwear" },
          { label: "Top & Pyjama Set", href: "/nightwear" },
          { label: "Top & Shorts Set", href: "/nightwear" },
          { label: "Nighty & Robe", href: "/nightwear" },
        ],
      },
      {
        title: "By Fabric",
        items: [
          { label: "Cotton", href: "/nightwear" },
          { label: "Satin", href: "/nightwear" },
          { label: "Lace", href: "/nightwear" },
          { label: "Rayon", href: "/nightwear" },
        ],
      },
    ],
  },
  Shapewear: {
    groups: [
      {
        title: "By Type",
        items: [
          { label: "Tummy Tucker", href: "/shapewear" },
          { label: "Saree Shapewear", href: "/shapewear" },
          { label: "Thigh Shaper", href: "/shapewear" },
          { label: "Bodysuits", href: "/shapewear" },
        ],
      },
    ],
  },
  Activewear: {
    groups: [
      {
        title: "Tops",
        items: [
          { label: "Sports Bra", href: "/activewear" },
          { label: "High Impact", href: "/activewear" },
          { label: "Crop Tops", href: "/activewear" },
          { label: "Active T-Shirts", href: "/activewear" },
        ],
      },
      {
        title: "Bottoms",
        items: [
          { label: "Tights & Pants", href: "/activewear" },
          { label: "Active Shorts", href: "/activewear" },
          { label: "Cycling Shorts", href: "/activewear" },
          { label: "Co-ords", href: "/activewear" },
        ],
      },
    ],
  },
};

// ── Footer Link Groups ────────────────────────────────────────────────
export const FOOTER_LINK_GROUPS = {
  "Shop By Category": [
    { label: "Bras", href: "/bras" },
    { label: "Panties", href: "/panties" },
    { label: "Nightwear & Sleepwear", href: "/nightwear" },
    { label: "Shapewear & Body Sculpting", href: "/shapewear" },
    { label: "Activewear & Yoga Tops", href: "/activewear" },
    { label: "Bridal Lingerie Sets", href: "/lingerie-sets" },
  ],
  "Fit & Care": [
    { label: "FitCode™ Calculator", href: "/size-guide" },
    { label: "Bra Size Chart", href: "/size-guide" },
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
    { label: "Store Locator", href: "/stores" },
    { label: "Privacy & Data Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
  ],
};
