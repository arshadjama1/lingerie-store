import type { NextConfig } from "next";

import fs from "fs";
import path from "path";

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

  webpack(config, { isServer, nextRuntime }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/db": path.resolve(__dirname, "db/index.ts"),
    };

    // @netlify/plugin-nextjs v5 sets NEXT_PRIVATE_BUILD_STANDALONE=true in its
    // onPreBuild hook, causing Next.js to run in standalone output mode and copy
    // .next/export-detail.json to .next/standalone/.next/export-detail.json.
    // That file only exists when output:'export' is configured, so on normal SSR
    // builds the copyfile call throws ENOENT and crashes the build.
    //
    // Fix: write a minimal stub after the server webpack compilation finishes
    // (via the done hook) so the file exists before Next.js performs the copy.
    if (isServer && !nextRuntime) {
      config.plugins ??= [];
      config.plugins.push({
        apply(compiler: {
          hooks: { done: { tap: (id: string, fn: () => void) => void } };
        }) {
          compiler.hooks.done.tap("WriteExportDetailJson", () => {
            const dest = path.join(
              process.cwd(),
              ".next",
              "export-detail.json"
            );
            try {
              if (!fs.existsSync(dest)) {
                fs.mkdirSync(path.dirname(dest), { recursive: true });
                fs.writeFileSync(
                  dest,
                  JSON.stringify({ version: 1, success: true })
                );
              }
            } catch {
              // best-effort — never fail the build over this
            }
          });
        },
      });
    }

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
