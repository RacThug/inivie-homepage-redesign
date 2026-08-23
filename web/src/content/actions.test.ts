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

  it("covers every section that leads somewhere", () => {
    // Eleven sections; the FAQ and Featured In lead nowhere by design, the
    // property card's control is per card, and membership carries two.
    expect(LABELS).toHaveLength(13);
  });
});
