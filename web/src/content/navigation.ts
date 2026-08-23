/**
 * Primary navigation, as data rather than markup.
 *
 * PRD ch. 6.1 requires every static section to read from typed structured
 * data, so that promoting one to dynamic later swaps a data source instead of
 * rewriting a component. The header is the first place that rule applies.
 *
 * Six items, grouped by what a guest came to do rather than by how the company
 * is organised. Production runs twelve paths here: seven nested primary items
 * plus five secondary ones. The B2B consultancy lines and the secondary
 * editorial pages move to the footer, which is why `footer.ts` carries more
 * links than this file does.
 */
export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Stay", href: "/stay" },
  { label: "Dine", href: "/dine" },
  { label: "Wellness", href: "/wellness" },
  { label: "Offers", href: "/offers" },
  { label: "Membership", href: "/membership" },
  { label: "About", href: "/about" },
] as const;

/**
 * Booking runs on a separate system, which PRD ch. 4.2 puts out of scope. The
 * control leads there rather than implementing it.
 */
export const BOOKING_CTA: NavItem = {
  label: "Book Now",
  href: "https://booking.inivie.com",
} as const;

/** The one spelling of the brand, per the brief ch. 4A. */
export const BRAND_NAME = "iNi ViE";
