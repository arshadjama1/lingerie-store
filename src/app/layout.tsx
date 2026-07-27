import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zivame-Style Premium Lingerie Store",
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
      className={`h-full antialiased ${poppins.variable} ${playfair.variable}`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
