import type { NextConfig } from "next";

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Standalone-output ENOENT workaround
// ---------------------------------------------------------------------------
// @netlify/plugin-nextjs v5 sets NEXT_PRIVATE_STANDALONE=true in onPreBuild.
// Next.js reads this flag and sets config.output = 'standalone', then during
// "Collecting build traces" it calls copyTracedFiles() which tries to copy
// .next/export-detail.json (traced as a dependency of server.js) into
// .next/standalone/.next/. That file only exists when output:'export' is
// configured; for a normal SSR build Next.js itself deletes it early, so the
// copyFile call throws ENOENT and crashes the build.
//
// Fix: patch fs.promises.copyFile so that any copyFile whose *source* path
// ends in 'export-detail.json' is silently skipped when the file is missing.
// This runs once at config load time (before any Next.js build code), so it
// is in effect throughout the entire build process.
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
    if (String(src).endsWith("export-detail.json") && !fs.existsSync(src)) {
      return; // skip — file does not exist; standalone copy is safe to skip
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalCopyFile(src, dest, ...(rest as any[]));
  } as typeof originalCopyFile;
}
// ---------------------------------------------------------------------------

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
