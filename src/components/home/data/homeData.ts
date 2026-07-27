import {
  Lock,
  RefreshCw,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  Users,
} from "lucide-react";

// ── Super Saver Combo Deals Strip ────────────────────────────────────
export const COMBO_DEALS_DATA = [
  {
    id: "combo-4-bras",
    label: "4 Bras",
    price: "₹899",
    original: "₹1,400",
    saving: "36% OFF",
    href: "/sale",
    color: "from-black/80 via-pink-950/45 to-transparent",
    image: "/images/home/cat_bras.jpg",
  },
  {
    id: "combo-3-bras",
    label: "3 Bras",
    price: "₹1,099",
    original: "₹1,600",
    saving: "31% OFF",
    href: "/sale",
    color: "from-black/80 via-purple-950/45 to-transparent",
    image: "/images/home/hero_slide_1.jpg",
  },
  {
    id: "combo-4-panties",
    label: "4 Panties",
    price: "₹599",
    original: "₹900",
    saving: "33% OFF",
    href: "/sale",
    color: "from-black/80 via-fuchsia-950/45 to-transparent",
    image: "/images/home/cat_panties.jpg",
  },
  {
    id: "combo-3-panties",
    label: "3 Panties",
    price: "₹599",
    original: "₹850",
    saving: "29% OFF",
    href: "/sale",
    color: "from-black/80 via-rose-950/45 to-transparent",
    image: "/images/home/promo_banner_1.jpg",
  },
];

// ── 2x2 Playful Category Tiles ───────────────────────────────────────
export const PLAYFUL_CATEGORIES_DATA = [
  {
    title: "Top & Pjs",
    subtitle: "Comfy Lounge Sets",
    bgGradient: "from-pink-400 via-rose-300 to-pink-200",
    href: "/nightwear",
    image: "/images/home/hero_slide_2.jpg",
    badge: "3 FOR 1099",
  },
  {
    title: "Activewear",
    subtitle: "High-Impact Fitness",
    bgGradient: "from-sky-400 via-cyan-300 to-blue-200",
    href: "/activewear",
    image: "/images/home/hero_slide_3.jpg",
    badge: "MIN 30% OFF",
  },
  {
    title: "Budget Buys",
    subtitle: "Under ₹499 Essentials",
    bgGradient: "from-indigo-300 via-purple-200 to-pink-100",
    href: "/sale",
    image: "/images/home/cat_bras.jpg",
    badge: "UNDER ₹499",
  },
  {
    title: "Panty Packs",
    subtitle: "Value Combos & Packs",
    bgGradient: "from-amber-200 via-orange-200 to-pink-200",
    href: "/panties",
    image: "/images/home/cat_panties.jpg",
    badge: "4 @ ₹599",
  },
];

// ── Slanted Ribbon Edit Cards ────────────────────────────────────────
export const RIBBON_EDITS_DATA = [
  {
    ribbon: "NO BRA BRA",
    subtext: "Feel Weightless & Wireless",
    tagColor: "bg-[var(--accent)] text-white shadow-md",
    href: "/bras",
    image: "/images/home/clovia_slanted_1.jpg",
  },
  {
    ribbon: "GYM READY",
    subtext: "High Impact & Bounce Control",
    tagColor: "bg-cyan-600 text-white shadow-md",
    href: "/activewear",
    image: "/images/home/hero_slide_3.jpg",
  },
  {
    ribbon: "PARTY IN SECRET",
    subtext: "Backless, Strapless & Multiway",
    tagColor: "bg-purple-600 text-white shadow-md",
    href: "/bras",
    image: "/images/home/promo_banner_1.jpg",
  },
];

// ── Comfort Feature Cards ─────────────────────────────────────────────
export const FEATURED_COMFORT_CARDS_DATA = [
  {
    title: "T-SHIRT BRAS",
    discount: "MIN 40% OFF",
    image: "/images/home/hero_slide_1.jpg",
    href: "/bras",
  },
  {
    title: "NON-PADDED",
    discount: "MIN 40% OFF",
    image: "/images/home/promo_banner_2.jpg",
    href: "/bras",
  },
  {
    title: "PUSH-UP BRAS",
    discount: "MIN 40% OFF",
    image: "/images/home/clovia_slanted_1.jpg",
    href: "/bras",
  },
  {
    title: "SPORTS BRAS",
    discount: "MIN 30% OFF",
    image: "/images/home/hero_slide_3.jpg",
    href: "/activewear",
  },
];

// ── Time of Day Occasion Cards ────────────────────────────────────────
export const TIME_OCCASIONS_DATA = [
  {
    ribbon: "LAZY MORNINGS",
    title: "Soft Cotton Tees & Tops",
    tagColor: "bg-pink-500",
    href: "/nightwear",
    image: "/images/home/promo_banner_2.jpg",
  },
  {
    ribbon: "LAZY AFTERNOONS",
    title: "Breezy Shorts & Pyjamas",
    tagColor: "bg-amber-500",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
  },
  {
    ribbon: "ALL DAY LONG",
    title: "Breathable Daily Essentials",
    tagColor: "bg-emerald-500",
    href: "/bras",
    image: "/images/home/hero_slide_1.jpg",
  },
];

// ── Floral Fabric Cards ───────────────────────────────────────────────
export const FLORAL_FABRICS_DATA = [
  {
    name: "Cotton Bras",
    offer: "Soft & Breathable",
    href: "/bras",
    image: "/images/home/cat_bras.jpg",
    color: "border-pink-300/80 bg-pink-50/60",
  },
  {
    name: "Cotton Panties",
    offer: "Everyday Comfort",
    href: "/panties",
    image: "/images/home/cat_panties.jpg",
    color: "border-amber-300/80 bg-amber-50/60",
  },
  {
    name: "Camisoles",
    offer: "Layering Tops",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
    color: "border-purple-300/80 bg-purple-50/60",
  },
  {
    name: "Boyshorts",
    offer: "Anti-Chafing Fit",
    href: "/panties",
    image: "/images/home/cat_shapewear.jpg",
    color: "border-rose-300/80 bg-rose-50/60",
  },
];

// ── Style Cutout Cards ────────────────────────────────────────────────
export const STYLE_CUTOUTS_DATA = [
  {
    name: "Push-Up Bra",
    href: "/bras",
    image: "/images/home/cat_bras.jpg",
    bg: "bg-pink-50 border-pink-200",
  },
  {
    name: "Bralette",
    href: "/bras",
    image: "/images/home/cat_nightwear.jpg",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    name: "Strapless Bra",
    href: "/bras",
    image: "/images/home/clovia_slanted_1.jpg",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    name: "Pyjama Sets",
    href: "/nightwear",
    image: "/images/home/hero_slide_2.jpg",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    name: "Shorts Sets",
    href: "/nightwear",
    image: "/images/home/cat_activewear.jpg",
    bg: "bg-cyan-50 border-cyan-200",
  },
  {
    name: "Nighties",
    href: "/nightwear",
    image: "/images/home/cat_nightwear.jpg",
    bg: "bg-emerald-50 border-emerald-200",
  },
];

// ── Customer Testimonials ─────────────────────────────────────────────
export const TESTIMONIALS_DATA = [
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    text: "Finally found bras that actually fit! The T-shirt bra is seamless under any outfit. The quality is just amazing.",
    product: "T-Shirt Bra",
    avatar: "P",
  },
  {
    name: "Ananya R.",
    location: "Bangalore",
    rating: 5,
    text: "Ordered the nightwear set and I am obsessed. The fabric is SO soft and it arrived in the most discreet packaging.",
    product: "Satin Night Set",
    avatar: "A",
  },
  {
    name: "Divya M.",
    location: "Delhi",
    rating: 5,
    text: "The size calculator was a game changer. Discovered I was wearing the wrong size for 10 years! Love the fit now.",
    product: "Size Calculator",
    avatar: "D",
  },
  {
    name: "Kavya T.",
    location: "Chennai",
    rating: 4,
    text: "Super fast delivery and the packaging is so classy. The sports bra is great for my yoga sessions.",
    product: "Sports Bra",
    avatar: "K",
  },
];

// ── Trust Items ───────────────────────────────────────────────────────
export const TRUST_ITEMS_DATA = [
  {
    title: "Free Express Shipping",
    desc: "On all orders above ₹999",
    icon: Truck,
  },
  {
    title: "15-Day Easy Returns",
    desc: "Hassle-free size exchanges",
    icon: RefreshCw,
  },
  {
    title: "100% Discreet Packaging",
    desc: "Plain unmarked boxes, always",
    icon: Lock,
  },
  {
    title: "Perfect Fit Guaranteed",
    desc: "Expert sizing & support",
    icon: ShieldCheck,
  },
];

// ── Brand Stats ───────────────────────────────────────────────────────
export const BRAND_STATS_DATA = [
  { value: "50 Lac+", label: "Happy Customers", icon: Users },
  { value: "1000+", label: "Styles Available", icon: Tag },
  { value: "50+", label: "Sizes Offered", icon: ShieldCheck },
  { value: "4.8★", label: "Average Rating", icon: Star },
];

// ── Product Categories Filter Tabs ────────────────────────────────────
export const PRODUCT_TABS_DATA = [
  "ALL BESTSELLERS",
  "BRAS",
  "PANTIES",
  "NIGHTWEAR",
  "ACTIVEWEAR",
];
