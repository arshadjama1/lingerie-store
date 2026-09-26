import type { MetadataRoute } from "next";

/**
 * Instructs search engine crawlers which paths to index and which to skip.
 * Generated at /robots.txt by Next.js at request time.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout/",
          "/order-success/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.surekh.co.in"}/sitemap.xml`,
  };
}
