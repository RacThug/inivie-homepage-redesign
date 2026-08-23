/**
 * The words around the Featured Properties section.
 *
 * The properties themselves come from the CMS over the Laravel API, which is
 * the whole point of the section. What lives here is the frame around them,
 * and that frame is static content, so it is typed structured data like every
 * other static section on the page (PRD ch. 6.1).
 *
 * Wording is production's, kept as brand voice. "View All Family" reads less
 * plainly than "View all properties" would, and PRD ch. 6.2 accepts that cost
 * knowingly: the portfolio is the family.
 */

import type { Action } from "./action";
import type { CarouselLabels } from "./carousel";

export const FEATURED_PROPERTIES = {
  eyebrow: "Stay With Us",
  heading: "Featured property for you",
  intro:
    "Exclusive stays designed to make your getaway unforgettable. Find the place you’ve been dreaming of, and turn every moment into something real.",
  /**
   * A quiet line in place of the grid when the API cannot be read (F5). It
   * carries no control of its own: the section's own "View All Family" pill is
   * already on the page and leads exactly where this sentence points.
   */
  unavailable:
    "Our featured stays cannot be shown right now. Every property is still available on the stays page.",
} as const;

/** Every card's call to action. The property it leads to is named in the
 *  control's accessible label, so three of these on one page are told apart
 *  by a screen reader rather than read out as three identical links. */
export const PROPERTY_CARD_ACTION = "View property";

/**
 * Right aligned on the heading row from the desktop breakpoint, below the copy
 * on mobile. Rendered as a filled `ink` pill rather than a text link, per PRD
 * ch. 6.2.
 */
export const FEATURED_PROPERTIES_ACTION: Action = {
  label: "View All Family",
  href: "/stay",
} as const;

/**
 * The words on the carousel's own controls, none of which are visible: the
 * steps and the dots are icons and marks, so each of these is the whole of
 * what the control says when it is read out.
 */
export const FEATURED_PROPERTIES_CAROUSEL: CarouselLabels = {
  /** Without the word carousel, which `aria-roledescription` already says. */
  label: "Featured properties",
  previous: "Previous property",
  next: "Next property",
  goTo: "Go to {name}",
} as const;

/**
 * F3: up to six cards, and six is what the carousel asks for. Below six the
 * track cannot cover its own viewport twice and stops looping, which is a
 * decision `PropertyCarousel` makes from the data rather than from this
 * number, so a CMS with three published properties still reads correctly.
 */
export const FEATURED_PROPERTY_COUNT = 6;
