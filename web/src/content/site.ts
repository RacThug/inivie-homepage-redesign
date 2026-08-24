/**
 * The words that describe the site itself rather than any section of it.
 *
 * They are here rather than inline in `layout.tsx` because each is now read
 * from four places - the document title, Open Graph, the Twitter card and the
 * `Organization` structured data of PRD ch. 8.3 - and a description that says
 * one thing to a search engine and another to a social preview is a defect
 * nobody notices until it is shared.
 */

export const SITE = {
  /** Production's own, matching the brand rather than the domain. */
  name: "iNi ViE Hospitality",

  /**
   * Long enough to survive a search result's truncation with something left,
   * and it names the three things the page is actually about.
   */
  description:
    "Resorts, villas, and hotels across Bali and beyond, from iNi ViE Hospitality. Book a stay, discover our restaurants and spas, and join the WeInivie membership.",

  /** The social sharing card. 1200 by 630, the size every network crops to. */
  image: {
    src: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "A guest floating in the pool of a walled garden villa in Bali, seen from above.",
  },

  /** Where the brand is registered, for `Organization` structured data. */
  country: "ID",
} as const;
