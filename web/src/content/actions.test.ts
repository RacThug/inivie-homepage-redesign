import { describe, expect, it } from "vitest";

import {
  FEATURED_PROPERTIES_ACTION,
  PROPERTY_CARD_ACTION,
} from "./featured-properties";
import { WELCOME } from "./hero";
import { JOURNAL } from "./journal";
import { MEMBERSHIP } from "./membership";
import { OFFERS } from "./offers";
import { STORY } from "./story";
import { CULINARY, WELLNESS } from "./venues";

/**
 * Every call to action on the homepage, gathered from the modules that own
 * them, so the rule below can be checked once rather than section by section.
 */
const LABELS = [
  WELCOME.action.label,
  FEATURED_PROPERTIES_ACTION.label,
  PROPERTY_CARD_ACTION,
  CULINARY.action.label,
  WELLNESS.action.label,
  MEMBERSHIP.primary.label,
  MEMBERSHIP.secondary.label,
  ...STORY.chapters.map((chapter) => chapter.action.label),
  OFFERS.action.label,
  JOURNAL.action.label,
];

/**
 * Brief ch. 4A: every control names its destination, and no generic label
 * appears on more than one of them. Production leans on a single repeated
 * "Discover More", which appeared twelve times on one page.
 *
 * This is checked over the content modules rather than over rendered markup
 * because that is where the words live, and because a rule about the page as a
 * whole cannot be enforced from inside any one section.
 */
describe("the page's calls to action", () => {
  it("uses no label twice", () => {
    expect(new Set(LABELS).size).toBe(LABELS.length);
  });

  it("uses none of the labels that name nothing", () => {
    const generic = ["discover more", "learn more", "read more", "click here"];

    for (const label of LABELS) {
      expect(generic).not.toContain(label.toLowerCase());
    }
  });

  /** A label that names nothing is the failure this file is about; a label
   *  that names the wrong thing is the other half of it. Every destination is
   *  a real path or a real origin, never a placeholder. */
  it("sends every control somewhere real", () => {
    const hrefs = [
      WELCOME.action.href,
      FEATURED_PROPERTIES_ACTION.href,
      CULINARY.action.href,
      WELLNESS.action.href,
      MEMBERSHIP.primary.href,
      MEMBERSHIP.secondary.href,
      ...STORY.chapters.map((chapter) => chapter.action.href),
      OFFERS.action.href,
      JOURNAL.action.href,
    ];

    for (const href of hrefs) {
      expect(href).toMatch(/^(\/[a-z0-9-]|https:\/\/)/);
    }
  });
});
