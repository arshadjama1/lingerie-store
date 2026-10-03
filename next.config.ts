import type { NextConfig } from "next";

import fs from "fs";
import path from "path";

// Standalone build ENOENT guard for Netlify / OpenNext builds:
// In Next.js standalone tracing with webpack, Next.js can attempt to copy
// files that are either deleted during build (export-detail.json) or renamed
// between proxy.js <-> middleware.js.
if (process.env.NETLIFY || process.env.NEXT_PRIVATE_STANDALONE) {
  const originalCopyFile = fs.promises.copyFile;
  fs.promises.copyFile = async function patchedCopyFile(
    src: fs.PathLike,
    dest: fs.PathLike,
    ...rest: Parameters<typeof originalCopyFile> extends [
      unknown,
      unknown,
      ...infer R,
    ]
      ? R
      : never[]
  ) {
    const srcStr = String(src);
    if (!fs.existsSync(src)) {
      if (srcStr.endsWith("export-detail.json")) {
        return;
      }
      if (srcStr.endsWith("proxy.js")) {
        const middlewareSrc = srcStr.replace(/proxy\.js$/, "middleware.js");
        if (fs.existsSync(middlewareSrc)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return originalCopyFile(middlewareSrc, dest, ...(rest as any[]));
        }
        return;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalCopyFile(src, dest, ...(rest as any[]));
  } as typeof originalCopyFile;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // When using local Supabase (HTTP), the Next.js image optimizer can only
    // proxy HTTPS sources, so it returns 400 for http://127.0.0.1 URLs.
    // Setting unoptimized:true lets the browser fetch images directly instead.
    // In production NEXT_PUBLIC_SUPABASE_URL will be HTTPS, so this is false.
    unoptimized:
      process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http://") ?? false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Local Supabase instance — kept so the config error doesn't appear
        // even though unoptimized:true is the actual fix for HTTP sources.
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {
    resolveAlias: { "@/db": "./db/index.ts" },
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/db": path.resolve(__dirname, "db/index.ts"),
    };
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
