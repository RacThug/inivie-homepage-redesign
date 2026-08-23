/**
 * Our Special Offers.
 *
 * Five, not four. One column mobile, two tablet, three desktop with the first
 * spanning two: five items fill that grid exactly, a wide one plus one on the
 * first row and three on the second. Four would leave a hole in the bottom
 * right corner (brief ch. 4.8). Production carries five.
 *
 * A grid rather than production's carousel, for the reason the hero has no
 * carousel either: script on the critical path, items hidden from the first
 * view, and a horizontal drag surface competing with vertical page scroll on
 * a phone.
 *
 * **The banner carries its own title.** Production sets the offer name into
 * the artwork, and these are production's own banners. Rendering the title
 * again underneath would be the "title twice on one card" the brief ch. 7
 * rules out, so the title below is the link's accessible name rather than
 * visible text. That fixes production's real defect here, which is that all
 * five of its banners carry `alt="promo"` and are unreadable to a screen
 * reader.
 *
 * One departure worth naming: four of the five banners set that baked in
 * title in all caps, which the brief ch. 7 rules out for type this project
 * sets. It is not type this project sets. Re-lettering a client's artwork is
 * further than a homepage redesign reaches, so the artwork stands and the
 * rule holds everywhere the markup owns the words.
 */

export interface Offer {
  /** Never rendered as visible text: it is already in the artwork. It names
   *  the link for assistive technology and for a search engine. */
  readonly title: string;
  readonly href: string;
  readonly image: string;
  /** What the photograph shows, not what the offer is called. The title is
   *  carried by the link's own accessible name. */
  readonly imageAlt: string;
}

export const OFFERS = {
  eyebrow: "Offers",
  heading: "Our Special Offers",
  intro:
    "Seasonal rates, celebrations, and partnerships across the family of properties.",
  action: { label: "All offers", href: "/offers" },
  items: [
    {
      title: "Bali, Yours",
      href: "/bali-offers-yours",
      image: "/home/offers/bali-yours.webp",
      imageAlt:
        "Two guests on a walkway above a tree fern garden, with rattan loungers below.",
    },
    {
      title: "Advance Saver",
      href: "/offers/advance-saver",
      image: "/home/offers/advance-saver.webp",
      imageAlt:
        "Two guests standing hand in hand at the edge of a green pool surrounded by jungle.",
    },
    {
      title: "iNi ViE x Tap Club Canggu",
      href: "/offers/ini-vie-x-tap-club-canggu",
      image: "/home/offers/tap-club-canggu.webp",
      imageAlt: "A player reaching for a low shot on an indoor padel court.",
    },
    {
      title: "Summer Deals",
      href: "/offers/summer-deals",
      image: "/home/offers/summer-deals.webp",
      imageAlt:
        "Two guests walking hand in hand past the daybeds around a resort pool.",
    },
    {
      title: "Premium Honeymoon Package",
      href: "/offers/premium-honeymoon-package",
      image: "/home/offers/premium-honeymoon-package.webp",
      imageAlt: "A couple embracing under an arch of greenery on a stone path.",
    },
  ] as readonly Offer[],
} as const;
