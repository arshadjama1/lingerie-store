import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";

import { TeamPreviewIndicator } from "@/components/common/TeamPreviewIndicator";
import { TopProgressBar } from "@/components/common/TopProgressBar";

import "./globals.css";

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.surekh.co.in"
  ),
  title: "Surekh | Premium Lingerie & Intimate Apparel",
  description:
    "Shop Bras, Panties, Nightwear, Activewear & Shapewear with perfect fit assurance.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Derive the Supabase project origin so we can preconnect to it.
  // NEXT_PUBLIC_SUPABASE_URL is e.g. "https://abc123.supabase.co"
  // All storage-bucket images are served from that same origin.
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <head>
        {/*
         * Pre-open a TCP+TLS connection to the Supabase project before any
         * storage-bucket image requests are made. Saves 100–300 ms on first
         * image load on slow connections.
         */}
        {supabaseOrigin && (
          <link
            rel="preconnect"
            href={supabaseOrigin}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <TopProgressBar />
        {children}
        <TeamPreviewIndicator />
      </body>
    </html>
  );
}
