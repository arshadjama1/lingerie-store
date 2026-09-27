import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Award,
  CheckCircle2,
  Feather,
  Heart,
  Leaf,
  Scissors,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Breadcrumb } from "@/components/common/breadcrumb";

export const metadata: Metadata = {
  title: "Our Story & About Us | Surekh",
  description:
    "Discover the story of SUREKH, founded by Mrs. Surekha Dhumal. From tailoring roots to crafting premium, breathable, and sustainable innerwear for women at every stage of life.",
  openGraph: {
    title: "About SUREKH - Our Story & Philosophy",
    description:
      "Crafting premium, breathable, and sustainable innerwear designed for women at every stage of life. Founded by Mrs. Surekha Dhumal.",
    type: "website",
  },
};

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "The Home Endeavor",
    subtitle: "Mrs. Surekha Dhumal's Beginnings",
    description:
      "What began as a small home endeavor offering traditional saree fall, pico, and bespoke tailoring services, built on genuine craft and personal care.",
    icon: Scissors,
  },
  {
    step: "02",
    title: "Growing Destination",
    subtitle: "A Trusted Wardrobe Partner",
    description:
      "Gradually expanded into a trusted destination for sarees, dress materials, readymade outfits, and specialized shapewear loved by local patrons.",
    icon: Award,
  },
  {
    step: "03",
    title: "The Turning Point",
    subtitle: "Listening to Real Women",
    description:
      "Countless candid conversations revealed an everyday truth: finding innerwear that truly fits, supports, and breathes shouldn't be a daily struggle.",
    icon: Users,
  },
  {
    step: "04",
    title: "Research & Purpose",
    subtitle: "Testing Skin-Loving Fabrics",
    description:
      "Deep research into breathable bamboo and modal fabrics, gentle wire-free patterns, and silhouettes engineered specifically for Indian bodies.",
    icon: Sparkles,
  },
  {
    step: "05",
    title: "The Birth of SUREKH",
    subtitle: "Everyday Comfort for Every Stage",
    description:
      "Today, SUREKH delivers premium, sustainable, and functional elegance—empowering women to feel confident and completely at ease in their own skin.",
    icon: Heart,
  },
];

const BRAND_PILLARS = [
  {
    title: "Breathable & Sustainable",
    description:
      "Crafted with eco-conscious bamboo and modal fabrics that feel butter-soft, wick moisture, and allow your skin to breathe effortlessly through warm days.",
    icon: Leaf,
    badge: "Eco & Skin Friendly",
  },
  {
    title: "Thoughtful Craftsmanship",
    description:
      "Carefully engineered wire-free cuts, smooth seam finishes, and zero-dig elastics designed to avoid red marks and provide natural, all-day lift.",
    icon: Feather,
    badge: "Zero-Dig Fit",
  },
  {
    title: "For Every Stage of Life",
    description:
      "From daily foundational essentials to nursing comfort, active mobility, and contouring shapewear, we cater to every body at every milestone.",
    icon: Users,
    badge: "Inclusive Sizing",
  },
  {
    title: "Functional Elegance",
    description:
      "Modern minimalism meets feminine grace. Innerwear so seamless and flattering under Indian ethnic wear or western outfits you forget you have it on.",
    icon: Sparkles,
    badge: "Everyday Luxury",
  },
];

const STATS = [
  { value: "50 Lac+", label: "Women Across India" },
  { value: "95%", label: "Natural Bamboo & Modal" },
  { value: "XS – 3XL", label: "Inclusive Size Range" },
  { value: "100%", label: "Fit & Comfort Assurance" },
];

export default function AboutUsPage() {
  return (
    <div className="bg-white">
      {/* ── Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] bg-[#fff5f8]/50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
          />
        </div>
      </div>

      {/* ── Hero Banner Section ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff5f8] via-white to-white py-14 sm:py-20">
        {/* Subtle decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-pink-100/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-rose-50/70 blur-2xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-bold tracking-widest text-[var(--accent-plum)] uppercase">
                About Surekh • Our Story & Mission
              </span>
            </div>

            <h1 className="mt-6 font-serif text-3xl font-black tracking-tight text-[var(--accent-plum)] sm:text-5xl sm:leading-tight">
              Comfort That Works With Every Unique Silhouette
            </h1>

            <p className="mt-5 text-base leading-relaxed font-light text-gray-600 sm:text-lg">
              Dedicated to crafting premium, breathable, and sustainable
              innerwear designed for women at every stage of life. We bring
              together comfort, thoughtful craftsmanship, and functional
              elegance.
            </p>
          </div>
        </div>
      </section>

      {/* ── Founder & Origin Story (Core Narrative) ──────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Visual Column */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer decorative border container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-4 border-white bg-pink-50 shadow-xl">
                <Image
                  src="/images/home/brand_story_banner.jpg"
                  alt="SUREKH Story - Founded with passion by Mrs. Surekha Dhumal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#240819]/80 via-transparent to-transparent" />

                {/* Floating Founder Badge */}
                <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <Scissors className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-wider text-[var(--accent-plum)] uppercase">
                        The Founder&apos;s Spark
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        Mrs. Surekha Dhumal
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Tailoring heritage turned modern intimate care
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent decorative badge */}
              <div className="absolute -top-4 -left-4 hidden rounded-lg border border-pink-200 bg-[var(--surface)] px-4 py-2.5 shadow-md sm:block">
                <p className="text-[11px] font-black tracking-widest text-[var(--accent)] uppercase">
                  Authentic Heritage
                </p>
                <p className="text-xs font-bold text-[var(--accent-plum)]">
                  Crafted for Indian Silhouettes
                </p>
              </div>
            </div>
          </div>

          {/* Story Narrative Column */}
          <div className="space-y-6 lg:col-span-7 lg:pl-6">
            <div>
              <span className="inline-block text-xs font-black tracking-widest text-[var(--accent)] uppercase">
                Our Story
              </span>
              <h2 className="mt-2 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-4xl sm:leading-tight">
                From a Small Home Endeavor to a Movement for Daily Ease
              </h2>
            </div>

            <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
              <p>
                What began as a small home endeavor by{" "}
                <strong className="font-semibold text-gray-950">
                  Mrs. Surekha Dhumal
                </strong>
                —offering traditional saree fall, pico, and tailoring
                services—gradually grew into a trusted destination for sarees,
                dress materials, readymade outfits, and shapewear.
              </p>

              <p>
                Over the years, one thing became clear through countless
                conversations with women of all ages:{" "}
                <span className="font-medium text-gray-950">
                  finding innerwear that truly fits, supports, and feels
                  comfortable shouldn&apos;t have to be a daily struggle.
                </span>
              </p>

              {/* Highlight Callout */}
              <div className="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--surface)] p-5 shadow-xs">
                <p className="font-serif text-base text-[var(--accent-plum)] italic sm:text-lg">
                  &ldquo;Different bodies have different needs. Yet, comfortable
                  and thoughtfully designed innerwear was often hard to
                  find.&rdquo;
                </p>
              </div>

              <p>
                This gap inspired us to look deeper—to understand what women
                truly needed from the first thing they wear every day. Through
                research, testing, and a commitment to doing better, we
                discovered the importance of breathable fabrics, thoughtful
                designs, and comfort that works with every unique silhouette.
              </p>

              {/* The Birth of SUREKH announcement card */}
              <div className="mt-6 rounded-2xl border border-pink-200/80 bg-gradient-to-br from-[#fff5f8] to-white p-6 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                  <h3 className="font-serif text-lg font-black tracking-wide text-[var(--accent-plum)]">
                    And that is how SUREKH was born.
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  Today, SUREKH is dedicated to crafting premium, breathable,
                  and sustainable innerwear designed for women at every stage of
                  life. We bring together comfort, thoughtful craftsmanship, and
                  functional elegance—so every woman can feel supported,
                  confident, and completely at ease in her own skin, every
                  single day.
                </p>
              </div>
            </div>

            {/* Quick check bullets */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Zero-pinch, wire-free designs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Natural, breathable bamboo & modal</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Comfort for every stage of life</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Discreet & respectful experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Evolution Timeline ────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black tracking-widest text-[var(--accent)] uppercase">
              The Journey
            </p>
            <h2 className="mt-2 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-4xl">
              From Needle & Thread to a Modern Sanctuary
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Tracing how genuine empathy and attentive listening shaped every
              chapter of the SUREKH story.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative flex flex-col justify-between rounded-xl border border-pink-100 bg-white p-6 shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl font-black text-pink-300">
                        {item.step}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="mt-5 text-base font-bold text-[var(--accent-plum)]">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-[var(--accent)]">
                      {item.subtitle}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Brand Pillars & Values ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-black tracking-widest text-[var(--accent)] uppercase">
            The SUREKH Philosophy
          </span>
          <h2 className="mt-2 font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-4xl">
            Thoughtful Innerwear, Made Better
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Every garment we produce is measured against four foundational
            commitments.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {BRAND_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group hover:shadow-floating flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-7 shadow-xs transition-all duration-200 hover:border-[var(--accent)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-[var(--accent-dark)] uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-[var(--accent-plum)]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-gray-600">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Key Impact Numbers ────────────────────────────────────────── */}
      <section className="border-t border-pink-900/60 bg-[#240819] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="font-serif text-3xl font-black text-pink-300 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="text-xs font-medium tracking-wider text-pink-100/80 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Promise & Standards ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border border-pink-100 bg-gradient-to-r from-[#fff5f8] via-white to-pink-50/50 p-8 sm:p-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <span className="text-xs font-black tracking-widest text-[var(--accent)] uppercase">
                Our Promise to You
              </span>
              <h2 className="font-serif text-2xl font-black text-[var(--accent-plum)] sm:text-3xl">
                Innerwear Should Empower Your Day, Never Interfere
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">
                Whether you are stepping into a demanding workday, enjoying
                peaceful moments at home, or getting dressed for a memorable
                celebration—SUREKH is engineered to sit effortlessly against
                your body. No adjustments, no discomfort, no compromise.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-gray-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  <span>48-Hour Damage Replacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                  <span>100% Discreet Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-[var(--accent)]" />
                  <span>Eco-conscious Manufacturing</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Link
                href="/bras"
                className="flex w-full items-center justify-center gap-2 rounded-none bg-[var(--accent)] px-8 py-4 text-xs font-black tracking-wider text-white uppercase shadow-md transition-colors hover:bg-[var(--accent-dark)] sm:w-auto"
              >
                Shop Breathable Bras <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/panties"
                className="flex w-full items-center justify-center gap-2 rounded-none border border-pink-300 bg-white px-8 py-4 text-xs font-bold tracking-wider text-[var(--accent-plum)] uppercase shadow-xs transition-colors hover:bg-pink-50 sm:w-auto"
              >
                Explore Undies & Packs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
