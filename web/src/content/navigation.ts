/**
 * Primary navigation, as data rather than markup.
 *
 * PRD ch. 6.1 requires every static section to read from typed structured
 * data, so that promoting one to dynamic later swaps a data source instead of
 * rewriting a component. The header is the first place that rule applies.
 *
 * The structure is production's, read off inivie.com rather than invented:
 * five desktop entries, four of which are hover groups over a brand family and
 * one of which is a plain link. Production's own burger adds Consultant and
 * Offers on top of these; both already have a home in `footer.ts`, so the two
 * navigations here stay identical to each other rather than teaching the
 * visitor two different site structures.
 */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** A label that opens a panel rather than leading anywhere itself. */
export interface NavGroup {
  readonly label: string;
  readonly children: readonly NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

/**
 * This project redesigns the homepage and nothing else, so not one of these
 * destinations exists inside the application. Every one is an absolute URL to
 * the live property that owns it, and every one opens in a new tab: leaving
 * the redesign in place is the point, and half of them are separate brands on
 * separate domains regardless.
 */
export const PRIMARY_NAV: readonly NavEntry[] = [
  {
    label: "Resort & Villa",
    children: [
      { label: "iNi ViE", href: "https://inivie.com/brand" },
      { label: "SOLO", href: "https://stayatsolo.com" },
    ],
  },
  {
    label: "Wonderspace",
    children: [
      { label: "Restaurant", href: "https://thewonderspace.com/brand" },
      {
        label: "Beach & Day Club",
        href: "https://thewonderspace.com/brand#day-club",
      },
      { label: "Kids & Playground", href: "https://maimain.com/" },
    ],
  },
  {
    label: "Svaha Wellness",
    children: [
      { label: "Svaha Spa", href: "https://svahawellness.com/location" },
      { label: "Hammana", href: "https://hammanaspa.com/" },
    ],
  },
  { label: "Souljourn", href: "https://inivie.com/souljourn" },
  {
    label: "WeInivie",
    children: [
      { label: "We Inivie", href: "https://inivie.com/membership" },
      { label: "Sign Up", href: "https://booking.inivie.com/en/register" },
    ],
  },
] as const;

/**
 * Booking runs on a separate system, which PRD ch. 4.2 puts out of scope. The
 * control leads there rather than implementing it.
 */
export const BOOKING_CTA: NavLink = {
  label: "Book Now",
  href: "https://booking.inivie.com",
} as const;

/** The one spelling of the brand, per the brief ch. 4A. */
export const BRAND_NAME = "iNi ViE";

/**
 * The wordmark, in the two tones the header switches between. The asset is
 * production's, recoloured for the light ground rather than filtered at
 * runtime: a CSS filter that approximates ink is a different colour on every
 * browser, and the palette in `globals.css` is meant to be the only place a
 * colour is decided.
 */
export const BRAND_LOGO = {
  light: "/inivie-logo-light.png",
  ink: "/inivie-logo-ink.png",
  width: 248,
  height: 248,
} as const;
