import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { getCatalogProduct, getCatalogRelated } from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGrid } from "@/components/product/product-grid";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProduct(slug).catch(() => null);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.metaTitle || `${product.name} | Amara Lingerie`;
  const description = product.metaDesc || product.description || "";
  const imageUrls = product.images.map((img) => img.url);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrls.map((url) => ({ url })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug).catch(() => null);

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category path, excluding current product
  const relatedProducts = await getCatalogRelated(
    product.id,
    product.categoryPath || "",
    4
  ).catch(() => []);

  // Format schema.org JSON-LD structured data
  const prices = product.variants.map((v) => Number(v.price));
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const hasStock = product.variants.some((v) => v.available > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.images.map((img) => img.url),
    sku: product.variants[0]?.sku || "",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowPrice,
      highPrice: highPrice,
      offerCount: product.variants.length,
      availability: hasStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(Number(product.ratingAvg) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingAvg,
        reviewCount: product.ratingCount,
      },
    }),
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* JSON-LD for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Product top fold client island */}
      <ProductActions product={product} />

      {/* Product bottom fold details (RSC, zero JS weight) */}
      <div
        className="mt-16 border-t pt-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* Main Description */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-serif text-xl text-[var(--foreground)]">
              Product Description
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-[var(--foreground-muted)]">
              {product.description ? (
                product.description
                  .split("\n\n")
                  .map((para, index) => <p key={index}>{para}</p>)
              ) : (
                <p>No description available for this product.</p>
              )}
            </div>

            {product.hsnCode && (
              <p className="mt-6 text-xs text-[var(--foreground-subtle)]">
                * HSN Code: {product.hsnCode} (tax inclusive pricing)
              </p>
            )}
          </div>

          {/* Specifications list */}
          <div className="rounded bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-widest text-[var(--foreground)] uppercase">
              Specifications
            </h2>
            {Object.keys(product.attributes || {}).length === 0 ? (
              <p className="text-xs text-[var(--foreground-subtle)]">
                No specific details listed.
              </p>
            ) : (
              <dl className="space-y-3 text-xs">
                {Object.entries(product.attributes || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b pb-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <dt className="font-medium text-[var(--foreground-muted)] capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-right font-semibold text-[var(--foreground)]">
                      {val}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div
          className="mt-16 border-t pt-10"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="mb-6 font-serif text-2xl tracking-tight text-[var(--foreground)]">
            You Might Also Like
          </h2>
          <Suspense
            fallback={
              <div className="h-96 w-full animate-pulse rounded bg-[var(--surface)]" />
            }
          >
            <ProductGrid products={relatedProducts} priorityCount={0} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
