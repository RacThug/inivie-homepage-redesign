import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE } from "@/content/site";
import { organizationLd } from "@/lib/organization";
import { siteOrigin } from "@/lib/site";

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
  /*
    Not preloaded, because nothing above the fold is set in it. The hero
    carries no type at all (PRD ch. 6.1) and the first heading on the page is
    the welcome block's, below it. Preloading put 8KB at high priority ahead
    of the hero photograph, to hold a face nobody was looking at yet. The
    size adjusted fallback `next/font` generates alongside it is what keeps
    the swap from moving the heading when it does arrive.
  */
  preload: false,
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * PRD ch. 8.3, everything except the canonical.
 *
 * `metadataBase` is what turns the relative paths below into the absolute
 * URLs Open Graph requires, and it comes from the same origin `robots.ts` and
 * `sitemap.ts` read, so the four artefacts cannot disagree about where this
 * site lives.
 *
 * The canonical is not here. It belongs to a page rather than to a shell, and
 * a canonical set on the layout would quietly claim every future route is the
 * homepage. `page.tsx` sets its own.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: SITE.name,
    /** A second page would read "About us | iNi ViE Hospitality". */
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: SITE.image.src,
        width: SITE.image.width,
        height: SITE.image.height,
        alt: SITE.image.alt,
      },
    ],
  },
  twitter: {
    // The card that shows the picture. `summary` crops it to a thumbnail,
    // which is a poor trade for a photograph of a place.
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [SITE.image.src],
  },
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
        {/*
          `Organization` structured data, built from the content the footer
          renders rather than restated (`lib/organization.ts`). React escapes
          the closing angle brackets of any string inside, so a value that
          happened to contain `</script>` cannot end the element early.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }}
          type="application/ld+json"
        />

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

        {/*
          Last in the document as well as last on the page, so the control
          that returns a visitor to the top is the final stop of a walk
          through it rather than something the tab order meets on the way.
        */}
        <BackToTop />
      </body>
    </html>
  );
}
