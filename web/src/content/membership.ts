/**
 * WeInivie Membership, the one section on the page that gets a dark panel.
 *
 * Production makes this a full bleed orange block. DESIGN-SYSTEM ch. 2.3
 * forbids exactly that: accent is for controls and markers, never a large
 * decorative fill, and white on accent measures 2.39 to 1. The section that
 * needs the most emphasis on the page takes it from an `ink` ground instead,
 * where gold is legible as text at 6.87 to 1 and the accent button is the one
 * warm thing in the frame. The brief ch. 4.6 asks that this not be
 * "corrected" back towards production.
 */

/**
 * Which of the four marks stands above a benefit. A name rather than a path,
 * because what a benefit is stays here and how it is drawn stays in the
 * component: swapping the drawing must not mean editing the copy.
 */
export type BenefitIcon = "gem" | "gift" | "tag" | "calendar";

export interface Benefit {
  readonly title: string;
  readonly icon: BenefitIcon;
}

export const MEMBERSHIP = {
  eyebrow: "WeInivie Membership",
  /** Production sets this in all caps. The brief ch. 7 rules all caps
   *  headlines out, so it is title case here and the words are unchanged. */
  heading: "Join WeInivie Membership",
  tagline: "Turn Bali Into Yours. Make Every Journey More Rewarding.",
  body: "Become a WeInivie member and enjoy exclusive access to unforgettable experiences across Bali. Discover special privileges, personalized offers, and curated moments designed just for you.",
  /** Two columns: copy and controls left, the benefits two by two right. One
   *  column with the benefits strung along the bottom leaves the top right of
   *  the panel empty, which is what makes the section read as unfinished at
   *  1440 (brief ch. 4.6). */
  benefits: [
    { title: "Priority VIP welcome", icon: "gem" },
    { title: "Special celebration setup", icon: "gift" },
    {
      title: "Exclusive savings at restaurants, spa and club outlets",
      icon: "tag",
    },
    { title: "Access to monthly member promotions", icon: "calendar" },
  ] as readonly Benefit[],
  primary: {
    label: "Become a Member",
    href: "https://booking.inivie.com/register",
  },
  secondary: { label: "Membership benefits", href: "/membership" },
} as const;
