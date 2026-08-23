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
 * The hero footage, matching production.
 *
 * Two cuts rather than one file at two crops, because production ships two:
 * a 1920x1080 landscape film and a portrait one that is a different edit
 * entirely, not a reframing of the first. The portrait cut is stored 1080 by
 * 1080 with a 9:16 sample aspect, so it is 9:16 on screen rather than the
 * square its pixel dimensions read as. The breakpoint is production's:
 * it serves the square cut below 768px.
 *
 * Both are production's own files with the audio track removed and the moov
 * atom moved to the front. Neither video frame was re-encoded, so what plays
 * here is what plays on inivie.com, pixel for pixel; the audio was 164 kbps of
 * a track that a muted element can never sound, and `faststart` lets playback
 * begin before the whole file has arrived.
 */
export const HERO_VIDEO = {
  desktop: "/home/hero-desktop.mp4",
  mobile: "/home/hero-mobile.mp4",
  /** Production's own switch point. Below this width it serves the square cut. */
  mobileQuery: "(max-width: 767px)",
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
  destination: "Destination",
  /** One label for the stay, because it is one decision. The two dates are
   *  still two values, and still cross the seam as `checkin` and `checkout`. */
  dates: "Dates",
  datesEmpty: "Add dates",
  guests: "Guests",
  submit: "Search",
  /** The one tappable row the panel collapses into below the tablet
   *  breakpoint, where the fields side by side do not fit 375px. */
  summary: "Where and when",
} as const;

/**
 * The guest count, asked for rather than assumed.
 *
 * It was a hidden `adults=2` until the field existed, on the reasoning that a
 * guest picker is booking flow. That was wrong in one direction that matters:
 * a couple is not the same search as a family of five, and sending everybody
 * to a two adult result set means the first thing a family does on the booking
 * system is redo the search they already did here.
 *
 * `adults` is the only guest parameter production's query string carries, so
 * it is the only one offered. A children field would be a control whose value
 * is dropped at the seam.
 */
export const GUESTS = {
  min: 1,
  max: 8,
  default: 2,
} as const;

export const WELCOME = {
  heading: "iNi ViE Hospitality",
  body: "iNi ViE Hospitality is a Bali-based hospitality group creating meaningful stays, dining destinations, wellness experiences, and lifestyle concepts across the island. Built around thoughtful design, warm service, and memorable guest experiences, each brand is created to reflect the character of its destination while offering a distinctive way to experience Bali.",
  /** The brief ch. 4A: every control names its destination. Production
   *  repeats one "Discover More" twelve times on this page. */
  action: { label: "About iNi ViE", href: "/about" },
} as const;
