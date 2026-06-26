import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";

import { getCatalogFeatured } from "@/modules/catalog";

export const revalidate = 600;

export default async function HomePage() {
  const featuredProducts = await getCatalogFeatured(8).catch(() => []);

  const trustItems = [
    { title: "Free Shipping", desc: "On all orders above ₹999", icon: "🚚" },
    { title: "Easy Returns", desc: "Hassle-free 15-day exchanges", icon: "↩" },
    {
      title: "Discreet Packaging",
      desc: "Privacy is our priority",
      icon: "📦",
    },
    { title: "Secure Payment", desc: "100% safe checkout", icon: "🔒" },
  ];

  const categories = [
    { name: "Bras", desc: "Everyday comfort & support", href: "/bras" },
    { name: "Panties", desc: "Seamless breathable fits", href: "/panties" },
    {
      name: "Lingerie Sets",
      desc: "Coordinated luxury sets",
      href: "/lingerie-sets",
    },
    {
      name: "Shapewear",
      desc: "Sculpting silhouette control",
      href: "/shapewear",
    },
    { name: "Nightwear", desc: "Satin & modal sleepwear", href: "/nightwear" },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[60vh] flex-col justify-center px-6 text-center sm:px-12"
        style={{ background: "var(--surface)" }}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl">
            Designed to be worn, loved, and remembered.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--foreground-muted)]">
            Experience premium, everyday luxury tailored for the modern Indian
            woman. Elegant fits, exquisite fabrics.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/bras"
              className="rounded px-8 py-3.5 text-sm font-semibold transition-colors"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              Shop Now
            </Link>
            <Link
              href="/size-guide"
              className="rounded border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-black/5"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Find Your Size
            </Link>
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-serif text-2xl">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col justify-between rounded p-6 transition-all hover:shadow-md"
              style={{ background: "var(--surface)" }}
            >
              <div>
                <h3 className="font-serif text-lg font-medium transition-colors group-hover:text-[var(--accent-dark)]">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">
                  {cat.desc}
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold tracking-wider text-[var(--accent-dark)] uppercase">
                Explore &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">Featured Collection</h2>
          <Link
            href="/bras"
            className="text-xs font-semibold tracking-wider text-[var(--accent-dark)] uppercase hover:underline"
          >
            View All
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div
            className="rounded border border-dashed p-12 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm text-[var(--foreground-muted)]">
              No products in featured collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className="group flex flex-col gap-2"
              >
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded"
                  style={{ background: "var(--surface)" }}
                >
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--foreground-subtle)]">
                      No Image
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium tracking-widest text-[var(--foreground-muted)] uppercase">
                  {product.brandName}
                </p>
                <h3 className="line-clamp-2 font-serif text-sm leading-snug">
                  {product.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    {formatPrice(product.minPrice)}
                  </span>
                  {product.minMrp &&
                    parseFloat(product.minMrp) >
                      parseFloat(product.minPrice) && (
                      <span className="text-xs text-[var(--foreground-subtle)] line-through">
                        {formatPrice(product.minMrp)}
                      </span>
                    )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trust Strip */}
      <section
        className="mx-auto w-full max-w-7xl border-t px-4 pt-16 sm:px-6 lg:px-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <span
                className="mb-3 text-3xl"
                role="img"
                aria-label={item.title}
              >
                {item.icon}
              </span>
              <h3 className="text-sm font-semibold tracking-wider text-[var(--foreground)] uppercase">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
