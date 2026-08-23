import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

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

/**
 * The page shell: header, the page itself, footer.
 *
 * `main` grows so the footer sits at the bottom of a short page rather than
 * halfway up it. The header is fixed and deliberately adds no top offset here,
 * because the homepage hero is full bleed and is meant to run underneath it
 * (PRD ch. 6.1). A page without a hero owns its own top spacing.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-5 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-small focus:text-ink"
          href="#main"
        >
          Skip to content
        </a>
        <Header />
        <main className="flex-1" id="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
