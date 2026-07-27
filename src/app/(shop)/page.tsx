import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  Users,
} from "lucide-react";

import { getCatalogFeatured } from "@/modules/catalog";

import { CategoryTiles } from "@/components/home/CategoryTiles";
import { CloviaZivameFusion } from "@/components/home/CloviaZivameFusion";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export const revalidate = 600;

// ── Clovia "Shop More Pay Less" Combo Deals ─────────────────────────
const COMBO_DEALS = [
  {
    label: "4 Bras",
    price: "₹899",
    original: "₹1,400",
    saving: "36% OFF",
    href: "/sale",
    color: "from-black/80 via-pink-950/45 to-transparent",
    image: "/images/home/cat_bras.jpg",
  },
  {
    label: "3 Bras",
    price: "₹1,099",
    original: "₹1,600",
    saving: "31% OFF",
    href: "/sale",
    color: "from-black/80 via-purple-950/45 to-transparent",
    image: "/images/home/hero_slide_1.jpg",
  },
  {
    label: "4 Panties",
    price: "₹599",
    original: "₹900",
    saving: "33% OFF",
    href: "/sale",
    color: "from-black/80 via-fuchsia-950/45 to-transparent",
    image: "/images/home/cat_panties.jpg",
  },
  {
    label: "3 Panties",
    price: "₹599",
    original: "₹850",
    saving: "29% OFF",
    href: "/sale",
    color: "from-black/80 via-rose-950/45 to-transparent",
    image: "/images/home/promo_banner_1.jpg",
  },
];

// ── Clovia Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
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

// ── Trust Items ──────────────────────────────────────────────────────
const TRUST_ITEMS = [
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

// ── Brand Stats ──────────────────────────────────────────────────────
const STATS = [
  { value: "50 Lac+", label: "Happy Customers", icon: Users },
  { value: "1000+", label: "Styles Available", icon: Tag },
  { value: "50+", label: "Sizes Offered", icon: ShieldCheck },
  { value: "4.8★", label: "Average Rating", icon: Star },
];

export default async function HomePage() {
  const featuredProducts = await getCatalogFeatured(12).catch(() => []);

  return (
    <div className="flex flex-col gap-0 bg-white pb-16">
      {/* ── 1. Zivame Hero Banner Carousel ──────────────────────────── */}
      <HeroCarousel />

      {/* ── 2. Clovia "Shop More Pay Less" Super Saver Combo Strip ─── */}
      <section className="bg-gradient-to-r from-[#3d0a20] via-[#5c1032] to-[#7b1842] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-lg font-black tracking-tight text-white uppercase sm:text-2xl">
                Shop More, Pay Less
              </h2>
              <p className="mt-0.5 text-xs font-light text-pink-200">
                Linge super saver bundles — maximum comfort, minimum prices!
              </p>
            </div>
            <Link
              href="/sale"
              className="flex items-center gap-1 text-xs font-bold tracking-wider text-pink-300 uppercase transition-colors hover:text-white"
            >
              All Offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {COMBO_DEALS.map((deal) => (
              <Link
                key={deal.label}
                href={deal.href}
                className="group relative flex min-h-[175px] flex-col justify-between overflow-hidden rounded-none border border-white/20 p-5 text-center text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background Image */}
                <Image
                  src={deal.image}
                  alt={deal.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />

                {/* Light Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${deal.color}`}
                />

                {/* Card Content */}
                <div className="relative z-10 pt-2">
                  <p className="text-xs font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {deal.label}
                  </p>
                </div>

                <div className="relative z-10 mt-2">
                  <p className="text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-3xl">
                    {deal.price}
                  </p>
                  <p className="text-xs font-bold text-gray-200 line-through drop-shadow-sm">
                    {deal.original}
                  </p>
                  <span className="mt-2 inline-block rounded-none bg-white px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--accent-plum)] uppercase shadow-md">
                    {deal.saving}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Zivame Round Category Avatar Bar ─────────────────────── */}
      <div className="pt-4">
        <CategoryTiles />
      </div>

      {/* ── 4. Clovia + Zivame Master Feature Showcase ──────────────── */}
      <CloviaZivameFusion products={featuredProducts} />

      {/* ── 5. Curated Spotlight Dual Banners ────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Banner 1 */}
          <Link
            href="/lingerie-sets"
            className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
          >
            <Image
              src="/images/home/promo_banner_1.jpg"
              alt="Luxury Lace Edit"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-2">
              <span className="inline-block rounded-none bg-[var(--accent)] px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase">
                EXCLUSIVE EDIT
              </span>
              <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
                The Luxury
                <br />
                Lace Edit
              </h3>
              <p className="max-w-xs text-xs font-light text-gray-200">
                French-inspired lace bralettes, corsets & matching sets
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-all hover:bg-[var(--accent)] hover:text-white">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Banner 2 */}
          <Link
            href="/bras"
            className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-none border border-gray-100 p-8 shadow-md"
          >
            <Image
              src="/images/home/promo_banner_2.jpg"
              alt="Everyday Comfort"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/90 via-black/30 to-transparent" />
            <div className="relative z-10 space-y-2">
              <span className="inline-block rounded-none bg-amber-500 px-3 py-1 text-[10px] font-black tracking-widest text-black uppercase">
                BESTSELLERS
              </span>
              <h3 className="font-serif text-2xl leading-tight font-black text-white sm:text-3xl">
                Cloud-Soft
                <br />
                Everyday Bras
              </h3>
              <p className="max-w-xs text-xs font-light text-gray-200">
                Wireless cotton bras engineered for 18-hour skin comfort
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-none bg-white px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase transition-all hover:bg-[var(--accent)] hover:text-white">
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 6. FitCode™ Bra Size Finder Banner ──────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-none bg-gradient-to-r from-[var(--accent-plum)] via-[#7b1842] to-[var(--accent-dark)] p-8 text-white shadow-2xl sm:p-14">
          <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="max-w-2xl space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-none border border-pink-400/25 bg-pink-500/25 px-3 py-1 text-xs font-bold text-pink-200">
                <Sparkles className="h-3.5 w-3.5 text-pink-300" />
                FitCode™ Bra Size Calculator
              </div>
              <h2 className="font-serif text-2xl leading-tight font-black tracking-tight text-white sm:text-4xl">
                80% of Women Wear
                <br />
                the Wrong Bra Size!
              </h2>
              <p className="text-sm leading-relaxed font-light text-pink-100">
                Take our 60-second interactive size quiz to uncover your true
                cup size, recommended band fit, and custom style matches
                tailored for your body shape.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-pink-200 lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-pink-400" /> 100%
                  Accurate
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-pink-400" />{" "}
                  Personalised Fit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-pink-400" /> Under 1
                  Minute
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/size-guide"
                className="pulse-glow inline-flex transform items-center justify-center rounded-none bg-white px-10 py-4 text-sm font-black tracking-wider text-[var(--accent-plum)] uppercase shadow-xl transition-all hover:scale-105 hover:bg-[var(--accent)] hover:text-white"
              >
                Find My Perfect Fit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Clovia Brand Story & 50 Lac+ Women Stats ─────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-none shadow-lg">
            <Image
              src="/images/home/brand_story_banner.jpg"
              alt="Trusted by women across India"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a20]/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="inline-flex items-center gap-2 rounded-none bg-white/90 px-4 py-2 text-xs font-black tracking-wider text-[#3d0a20] uppercase shadow-lg backdrop-blur-sm">
                <Users className="h-4 w-4 text-[var(--accent)]" />
                Trusted by 50 Lac+ Women
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-black tracking-widest text-[var(--accent)] uppercase">
                Our Story
              </p>
              <h2 className="font-serif text-2xl leading-tight font-black text-[var(--accent-plum)] sm:text-3xl">
                Happy is Our Superpower
              </h2>
            </div>
            <p className="text-sm leading-relaxed font-light text-gray-600">
              LINGE combines joyful fashion ethos with fit precision. Every
              piece is designed for Indian body types, ensuring 100% skin
              comfort, shape retention, and unmatched confidence.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-none border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
                  >
                    <Icon className="mx-auto mb-1 h-5 w-5 text-[var(--accent)]" />
                    <p className="text-xl font-black text-[var(--accent-plum)]">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <Link
              href="/bras"
              className="inline-flex items-center gap-2 rounded-none bg-[var(--accent)] px-7 py-3.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-colors hover:bg-[var(--accent-dark)]"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Customer Testimonials Grid ───────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-2xl">
              What Our Customers Say
            </h2>
            <p className="mt-1 text-xs font-light text-gray-500 sm:text-sm">
              Real reviews from real women across India
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((review) => (
              <div
                key={review.name}
                className="rounded-none border border-[var(--border)] bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 fill-current ${i < review.rating ? "star-filled" : "star-empty"}`}
                    />
                  ))}
                </div>
                <p className="mb-4 text-xs leading-relaxed font-light text-gray-700">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-plum)] text-xs font-black text-white">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {review.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {review.location} · {review.product}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Zivame Trust Strip ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-none bg-[var(--accent-plum)] p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all group-hover:bg-[var(--accent)] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-black tracking-wider text-white uppercase sm:text-sm">
                    {item.title}
                  </h3>
                  <p className="mt-1 max-w-[160px] text-xs font-light text-pink-200">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
