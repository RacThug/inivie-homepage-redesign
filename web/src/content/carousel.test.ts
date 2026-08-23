import { describe, expect, it } from "vitest";

import { FEATURED_PROPERTIES_CAROUSEL } from "./featured-properties";
import { CULINARY, WELLNESS } from "./venues";

/**
 * Every set of carousel words on the page, from the modules that own them.
 */
const CAROUSELS = [
  ["Featured Properties", FEATURED_PROPERTIES_CAROUSEL],
  ["The Culinary Journey", CULINARY.carousel],
  ["Wellness Harmony Escape", WELLNESS.carousel],
] as const;

/**
 * These labels are read by a Server Component and handed to a client one, and
 * React serialises what crosses that boundary. A function among them is
 * refused at request time rather than at build time, which is a 500 on the
 * homepage and not a failing type check.
 *
 * `goTo` was a function for exactly as long as it took to open the page. The
 * component tests never caught it because they render the carousel directly,
 * on the client side of a boundary that is not there in a test. So the rule is
 * checked here, over the words themselves, where the boundary is a property of
 * the data rather than of any component.
 */
describe("the words on every carousel", () => {
  it.each(CAROUSELS)(
    "%s carries nothing React cannot serialise",
    (_, labels) => {
      for (const value of Object.values(labels)) {
        expect(typeof value).toBe("string");
      }
    },
  );

  /** The one placeholder the carousel fills in. Without it every dot on a
   *  six card track is announced with the same sentence. */
  it.each(CAROUSELS)("%s names the card each dot reaches", (_, labels) => {
    expect(labels.goTo).toContain("{name}");
  });

  /**
   * Three carousels sit on one page. A screen reader user moving between them
   * hears the control, not the section it is in, so two sections sharing a
   * word would offer two controls that cannot be told apart.
   */
  it("gives no two carousels the same control", () => {
    const spoken = CAROUSELS.flatMap(([, labels]) => [
      labels.label,
      labels.previous,
      labels.next,
    ]);

    expect(new Set(spoken).size).toBe(spoken.length);
  });
});
