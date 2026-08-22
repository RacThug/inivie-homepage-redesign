import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import "./globals.css";

/**
 * Fonts are self hosted through `next/font`, so there is no runtime request to
 * Google and no layout shift. DESIGN-SYSTEM ch. 3.1.
 *
 * Poppins has no variable cut on Google Fonts, so the one weight the type
 * scale actually uses is requested rather than the whole family. Great Vibes
 * is specified as optional and is deliberately not loaded, because nothing
 * renders it yet.
 */
const poppins = Poppins({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "iNi ViE Hospitality",
  description:
    "Resorts, villas, and hotels across Bali and beyond, from iNi ViE Hospitality.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
