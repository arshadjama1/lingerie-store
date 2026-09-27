import type { Metadata } from "next";

import { TeamPreviewIndicator } from "@/components/common/TeamPreviewIndicator";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.surekh.co.in"
  ),
  title: "Surekh | Premium Lingerie & Intimate Apparel",
  description:
    "Shop Bras, Panties, Nightwear, Activewear & Shapewear with perfect fit assurance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <TeamPreviewIndicator />
      </body>
    </html>
  );
}
