import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { getCatalogProduct, getCatalogRelated } from "@/modules/catalog";

import { Breadcrumb } from "@/components/common/breadcrumb";
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
    openGraph: {
      title,
      description,
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
    <main className="bg-white pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Product Top Fold Interactive Island */}
        <ProductActions product={product} />

        {/* Product Bottom Fold Details */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Description Box */}
            <div className="space-y-4 rounded-none border border-gray-100 bg-white p-6 shadow-xs sm:p-8 lg:col-span-2">
              <h2 className="font-serif text-xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-2xl">
                Product Details & Fabric Care
              </h2>
              <div className="space-y-4 text-xs leading-relaxed font-light text-gray-700 sm:text-sm">
                {product.description ? (
                  product.description
                    .split("\n\n")
                    .map((para, index) => <p key={index}>{para}</p>)
                ) : (
                  <p>
                    Designed for all-day skin comfort with premium breathable
                    fabric, shape retention, and precision support.
                  </p>
                )}
              </div>

              {product.hsnCode && (
                <p className="mt-6 border-t border-gray-100 pt-2 font-mono text-xs text-gray-400">
                  * HSN Code: {product.hsnCode} (tax inclusive pricing)
                </p>
              )}
            </div>

            {/* Specifications Box */}
            <div className="rounded-none border border-pink-100 bg-[var(--surface)] p-6 shadow-xs">
              <h2 className="mb-4 text-xs font-black tracking-widest text-[var(--accent-plum)] uppercase">
                Product Specifications
              </h2>
              {Object.keys(product.attributes || {}).length === 0 ? (
                <p className="text-xs font-medium text-gray-500">
                  Standard size fit & breathable fabric construction.
                </p>
              ) : (
                <dl className="space-y-3 text-xs">
                  {Object.entries(product.attributes || {}).map(
                    ([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b border-gray-200/60 pb-2"
                      >
                        <dt className="font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-right font-bold text-gray-900">
                          {val}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
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
    </main>
  );
}
