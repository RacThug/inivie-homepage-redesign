/**
 * What's New, the three latest articles.
 *
 * Three rather than production's six, so the page does not run too long
 * (PRD ch. 6.1). The blog itself stays on `blog.inivie.com`: this section is
 * a door to it, not a copy of it.
 *
 * Static today, and the clearest candidate on the page for a second dynamic
 * section after Featured Properties. Which is the whole reason it is typed
 * data: the card reads `Article`, and where the array comes from is one
 * import away from being a fetch.
 */

export interface Article {
  readonly title: string;
  /** Production files every homepage article under this one section. */
  readonly category: string;
  readonly href: string;
  readonly image: string;
  readonly imageAlt: string;
}

export const JOURNAL = {
  eyebrow: "Journal",
  heading: "What's New",
  /* No intro, for the reason `offers.ts` gives: neither production nor the
     design pass writes one, and the three titles say what the section is. */
  action: { label: "All articles", href: "/blog" },
  articles: [
    {
      title: "Best Hair Salons in Ubud: 12 Places for Cuts, Color and Spa",
      category: "Discover Bali",
      href: "https://blog.inivie.com/discover-bali/hair-salons-in-ubud",
      image: "/home/journal/hair-salons-in-ubud.jpg",
      imageAlt:
        "A guest having their hair washed at a basin during a salon treatment.",
    },
    {
      title: "Nusa Penida Guide: Beaches, Boat Times and Trip Costs in Bali",
      category: "Discover Bali",
      href: "https://blog.inivie.com/discover-bali/nusa-penida-guide",
      image: "/home/journal/nusa-penida-guide.jpg",
      imageAlt:
        "Wooden steps down the cliff to Kelingking Beach on Nusa Penida, above turquoise water.",
    },
    {
      title: "Bali in September: Weather, Crowds, and What to Pack",
      category: "Discover Bali",
      href: "https://blog.inivie.com/discover-bali/bali-in-september",
      image: "/home/journal/bali-in-september.jpg",
      imageAlt:
        "A timber deck and infinity pool looking out over palms and rice fields towards a volcano.",
    },
  ] as readonly Article[],
} as const;
