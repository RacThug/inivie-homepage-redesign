/**
 * The hero, the search panel, and the welcome block that follows them.
 *
 * PRD ch. 6.1 splits what production calls one section into three, and the
 * split is the point: the hero is a single photograph carrying the search
 * panel and no type at all, so the largest paint stays one image with nothing
 * to composite over it, and the 350 character company paragraph lands on a
 * plain ground below where the measure cap of DESIGN-SYSTEM ch. 3.3 can
 * actually hold.
 */

export const HERO_IMAGE = {
  src: "/home/hero.webp",
  alt: "A guest floating in the pool of a walled garden villa, seen from above, with a second guest on the deck beside it.",
} as const;

/**
 * Booking runs on a separate system, which PRD ch. 3.2 puts out of scope. The
 * panel is a real form that hands its fields to that system over a GET, and
 * stops there.
 *
 * Production posts an opaque numeric `city` id that appears nowhere else on
 * the page, so the destination name is sent instead. The mapping from a name
 * to whatever the booking engine calls that place belongs to the booking
 * engine, and this is the seam where this project stops.
 */
export const SEARCH_ACTION = "https://booking.inivie.com/destination";

export interface Destination {
  readonly value: string;
  readonly label: string;
}

/** Production's own nine, in production's order. */
export const DESTINATIONS: readonly Destination[] = [
  { value: "Canggu", label: "Canggu, Bali" },
  { value: "Jimbaran", label: "Jimbaran, Bali" },
  { value: "Karangasem", label: "Karangasem, Bali" },
  { value: "Legian", label: "Legian, Bali" },
  { value: "Sanur", label: "Sanur, Bali" },
  { value: "Seminyak", label: "Seminyak, Bali" },
  { value: "Ubud", label: "Ubud, Bali" },
  { value: "Uluwatu", label: "Uluwatu, Bali" },
  { value: "Tanah Lot", label: "Tanah Lot, Bali" },
] as const;

export const SEARCH_PANEL = {
  /** Named for assistive technology, because the panel is a landmark with no
   *  heading of its own: putting an H1 on it would fight the welcome block. */
  label: "Search for a stay",
  destination: "Choose destination",
  checkIn: "Check in",
  checkOut: "Check out",
  guests: "Guests",
  submit: "Search",
  /** The one tappable row the panel collapses into below the desktop
   *  breakpoint, where three fields side by side do not fit 375px. */
  summary: "Where and when",
  expand: "Open the search panel",
} as const;

/** Two adults, production's own default, sent as a hidden field rather than
 *  asked for: a guest count picker is booking flow, not homepage. */
export const DEFAULT_ADULTS = 2;

export const WELCOME = {
  heading: "iNi ViE Hospitality",
  body: "iNi ViE Hospitality is a Bali-based hospitality group creating meaningful stays, dining destinations, wellness experiences, and lifestyle concepts across the island. Built around thoughtful design, warm service, and memorable guest experiences, each brand is created to reflect the character of its destination while offering a distinctive way to experience Bali.",
  /** The brief ch. 4A: every control names its destination. Production
   *  repeats one "Discover More" twelve times on this page. */
  action: { label: "About iNi ViE", href: "/about" },
} as const;
