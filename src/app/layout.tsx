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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <TopProgressBar />
        {children}
        <TeamPreviewIndicator />
      </body>
    </html>
  );
}
