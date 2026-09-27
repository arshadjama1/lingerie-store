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
    id: "combo-3-bamboo-undies",
    label: "3 Bamboo Undies",
    price: "₹750",
    original: "₹900",
    saving: "17% OFF",
    href: "/p/bamboo-fabric-undie",
    color: "from-black/80 via-pink-950/45 to-transparent",
    image: "/images/products/bamboo-undie-black.png",
  },
  {
    id: "combo-seamless-pack",
    label: "Seamless Pack of 3",
    price: "₹750",
    original: "₹950",
    saving: "21% OFF",
    href: "/p/seamless-undie-pack-of-3",
    color: "from-black/80 via-purple-950/45 to-transparent",
    image: "/images/products/seamless-undie-pack.png",
  },
  {
    id: "combo-floral-pack",
    label: "3 Floral Undies",
    price: "₹750",
    original: "₹950",
    saving: "21% OFF",
    href: "/p/pack-of-3-floral-undie",
    color: "from-black/80 via-fuchsia-950/45 to-transparent",
    image: "/images/products/floral-undie-navy.png",
  },
  {
    id: "combo-lingerie-set",
    label: "Lingerie Set",
    price: "₹650",
    original: "₹850",
    saving: "24% OFF",
    href: "/p/luxuria-pad-lingerie-set",
    color: "from-black/80 via-rose-950/45 to-transparent",
    image: "/images/products/lingerie-set-olive.png",
  },
];

// ── 2x2 Playful Category Tiles ───────────────────────────────────────
export const PLAYFUL_CATEGORIES_DATA = [
  {
    title: "Bamboo Bras",
    subtitle: "Breathable & Soft",
    bgGradient: "from-pink-400 via-rose-300 to-pink-200",
    href: "/bras",
    image: "/images/products/bamboo-bra-black.png",
    badge: "FROM ₹400",
  },
  {
    title: "Floral Undies",
    subtitle: "Modal Pack of 3",
    bgGradient: "from-sky-400 via-cyan-300 to-blue-200",
    href: "/panties",
    image: "/images/products/floral-undie-navy.png",
    badge: "3 FOR ₹750",
  },
  {
    title: "Lingerie Sets",
    subtitle: "Coordinated Pairs",
    bgGradient: "from-indigo-300 via-purple-200 to-pink-100",
    href: "/sets",
    image: "/images/products/lingerie-set-olive.png",
    badge: "FROM ₹650",
  },
  {
    title: "Camisoles",
    subtitle: "5 Colours",
    bgGradient: "from-amber-200 via-orange-200 to-pink-200",
    href: "/loungewear",
    image: "/images/products/camisole-black.png",
    badge: "₹300 EACH",
  },
];

// ── Slanted Ribbon Edit Cards ────────────────────────────────────────
export const RIBBON_EDITS_DATA = [
  {
    ribbon: "BAMBOO SOFT",
    subtext: "95% Bamboo · Feels Like Skin",
    tagColor: "bg-[var(--accent)] text-white shadow-md",
    href: "/bras",
    image: "/images/products/bamboo-bra-black.png",
  },
  {
    ribbon: "SEAMLESS FIT",
    subtext: "No Lines · No Digging",
    tagColor: "bg-cyan-600 text-white shadow-md",
    href: "/panties",
    image: "/images/products/seamless-undie-pack.png",
  },
  {
    ribbon: "LUXURY SETS",
    subtext: "Padded & Coordinated",
    tagColor: "bg-purple-600 text-white shadow-md",
    href: "/sets",
    image: "/images/products/lingerie-set-olive.png",
  },
];

// ── Comfort Feature Cards ─────────────────────────────────────────────
export const FEATURED_COMFORT_CARDS_DATA = [
  {
    title: "BAMBOO BRAS",
    discount: "FROM ₹400",
    image: "/images/products/bamboo-bra-black.png",
    href: "/bras",
  },
  {
    title: "LOUNGE BRAS",
    discount: "FROM ₹300",
    image: "/images/products/mischief-lounge-bra-pink.png",
    href: "/bras",
  },
  {
    title: "LINGERIE SETS",
    discount: "FROM ₹650",
    image: "/images/products/lingerie-set-olive.png",
    href: "/sets",
  },
  {
    title: "CAMISOLES",
    discount: "₹300 EACH",
    image: "/images/products/camisole-pink.png",
    href: "/loungewear",
  },
];

// ── Time of Day Occasion Cards ────────────────────────────────────────
export const TIME_OCCASIONS_DATA = [
  {
    ribbon: "ALL DAY",
    title: "Bamboo Fabric Essentials",
    tagColor: "bg-pink-500",
    href: "/panties",
    image: "/images/products/bamboo-undie-black.png",
  },
  {
    ribbon: "LOUNGE AT HOME",
    title: "Camisoles & Lounge Bras",
    tagColor: "bg-amber-500",
    href: "/loungewear",
    image: "/images/products/camisole-black.png",
  },
  {
    ribbon: "DATE NIGHT",
    title: "Modal Bralette & Hipster Set",
    tagColor: "bg-emerald-500",
    href: "/sets",
    image: "/images/products/mischief-lounge-bra-pink.png",
  },
];

// ── Floral Fabric Cards ───────────────────────────────────────────────
export const FLORAL_FABRICS_DATA = [
  {
    name: "Bamboo Bras",
    offer: "Soft & Breathable",
    href: "/bras",
    image: "/images/products/bamboo-bra-cinder.png",
    color: "border-pink-300/80 bg-pink-50/60",
  },
  {
    name: "Seamless Undies",
    offer: "No-Show Comfort",
    href: "/panties",
    image: "/images/products/seamless-undie-navy.png",
    color: "border-amber-300/80 bg-amber-50/60",
  },
  {
    name: "Camisoles",
    offer: "Layering Tops",
    href: "/loungewear",
    image: "/images/products/camisole-pink.png",
    color: "border-purple-300/80 bg-purple-50/60",
  },
  {
    name: "Floral Undies",
    offer: "Modal Pack of 3",
    href: "/panties",
    image: "/images/products/floral-undie-pink.png",
    color: "border-rose-300/80 bg-rose-50/60",
  },
];

// ── Style Cutout Cards ────────────────────────────────────────────────
export const STYLE_CUTOUTS_DATA = [
  {
    name: "Bamboo Bra – Black",
    href: "/bras",
    image: "/images/products/bamboo-bra-black.png",
    bg: "bg-pink-50 border-pink-200",
  },
  {
    name: "Bamboo Bra – Navy",
    href: "/bras",
    image: "/images/products/bamboo-bra-navy.png",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    name: "Lounge Bra – Pink",
    href: "/bras",
    image: "/images/products/mischief-lounge-bra-pink.png",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    name: "Overlap Bralette Set",
    href: "/sets",
    image: "/images/products/lingerie-set-olive.png",
    bg: "bg-green-50 border-green-200",
  },
  {
    name: "Camisole – Pink",
    href: "/loungewear",
    image: "/images/products/camisole-pink.png",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    name: "Floral Undie Pack",
    href: "/panties",
    image: "/images/products/floral-undie-navy.png",
    bg: "bg-cyan-50 border-cyan-200",
  },
];

// ── Customer Testimonials ─────────────────────────────────────────────
export const TESTIMONIALS_DATA = [
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    text: "The Bamboo Fabric Bra is absolutely incredible — softest thing I've ever worn. No wires, no digging, just cloud-soft comfort all day.",
    product: "Bamboo Fabric Bra",
    avatar: "P",
  },
  {
    name: "Ananya R.",
    location: "Bangalore",
    rating: 5,
    text: "Ordered the Seamless Undie Pack of 3 and I'm obsessed. Completely invisible under tight clothes. The packaging was super discreet too!",
    product: "Seamless Undie Pack of 3",
    avatar: "A",
  },
  {
    name: "Divya M.",
    location: "Delhi",
    rating: 5,
    text: "The Overlap Bralette with Hipster Set is stunning! Perfect fit and the modal fabric feels luxurious on skin. Worth every rupee.",
    product: "Overlap Bralette with Hipster Set",
    avatar: "D",
  },
  {
    name: "Kavya T.",
    location: "Chennai",
    rating: 4,
    text: "Fast delivery and the camisole quality is great. Love that they have so many colour options. Will definitely order again!",
    product: "Camisole",
    avatar: "K",
  },
];

// ── Trust Items ───────────────────────────────────────────────────────
export const TRUST_ITEMS_DATA = [
  {
    title: "Free Express Shipping",
    desc: "On all orders above ₹1,299",
    icon: Truck,
  },
  {
    title: "15-Day Fit Exchange",
    desc: "Size exchange on bras & sets",
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
  { value: "8 Products", label: "Curated Styles", icon: Users },
  { value: "5 Fabrics", label: "Premium Materials", icon: Tag },
  { value: "XS – 3XL", label: "Size Range", icon: ShieldCheck },
  { value: "4.7★", label: "Average Rating", icon: Star },
];

// ── Product Category Filter Tabs (Bestseller Showcase) ────────────────
export const PRODUCT_TABS_DATA = [
  "ALL",
  "BRAS",
  "PANTIES",
  "SETS",
  "LOUNGEWEAR",
];
