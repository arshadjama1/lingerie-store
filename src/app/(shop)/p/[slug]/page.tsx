import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { getCatalogProduct, getCatalogRelated } from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGrid } from "@/components/product/product-grid";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    reviewPage?: string;
    color?: string;
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

  const title = product.metaTitle || `${product.name} | Surekh Storefront`;
  const description = product.metaDesc || product.description || "";
  const imageUrls = product.images.map((img) => img.url);

  return {
    title,
    description,
    alternates: {
      canonical: `/p/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrls.map((url) => ({ url })),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const reviewPage = Math.max(
    1,
    parseInt(resolvedSearchParams?.reviewPage ?? "1", 10)
  );
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
    <div className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Product Top Fold Interactive Island */}
        <ProductActions
          product={product}
          initialColor={resolvedSearchParams?.color}
        />

        {/* Product Bottom Fold Details Accordions */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <div className="mx-auto max-w-4xl">
            <ProductDetailsAccordion
              description={product.description}
              fabric={product.attributes?.fabric}
              careInstructions={product.attributes?.careInstructions}
              attributes={product.attributes || {}}
              hsnCode={product.hsnCode}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div
          id="reviews-section"
          className="mt-16 scroll-mt-24 border-t border-gray-100 pt-10"
        >
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-none bg-[var(--surface)]" />
            }
          >
            <ProductReviews productId={product.id} page={reviewPage} />
          </Suspense>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <div className="mb-6">
              <span className="mb-1 inline-block rounded-none bg-[var(--accent-subtle)] px-3 py-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase shadow-xs">
                YOU MIGHT ALSO LIKE
              </span>
              <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
                Recommended Pairings
              </h2>
            </div>
            <Suspense
              fallback={
                <div className="h-96 w-full animate-pulse rounded-none bg-[var(--surface)]" />
              }
            >
              <ProductGrid products={relatedProducts} priorityCount={0} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
