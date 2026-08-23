import { describe, expect, it } from "vitest";

import { SECTIONS } from "./page";

/**
 * The page composes and holds no logic, so there is exactly one rule here
 * worth a test, and it is the one DESIGN-SYSTEM ch. 6.7 makes: no two
 * neighbouring sections share a ground.
 *
 * It is tested over the list rather than over a rendering because the page
 * cannot be rendered in a test: Featured Properties is an async Server
 * Component reading the API, and standing a fake one up would test the fake.
 * The list is where the decision lives, so the list is what is checked.
 */
describe("the homepage's grounds", () => {
  it("never puts two neighbours on the same one", () => {
    const tones = SECTIONS.map(([, tone]) => tone);
    const collisions = tones.flatMap((tone, index) =>
      index > 0 && tone === tones[index - 1]
        ? [`sections ${index - 1} and ${index} are both ${tone}`]
        : [],
    );

    expect(collisions).toEqual([]);
  });

  /** Eleven sections in PRD ch. 6.1, of which the hero is not one of these:
   *  it is full bleed and is composed outside the list. */
  it("carries the ten sections that sit inside the container", () => {
    expect(SECTIONS).toHaveLength(10);
  });

  /** `ink` is the one section that interrupts the alternation rather than
   *  taking a step in it (ch. 6.11), and one is all there should ever be. */
  it("darkens exactly one of them", () => {
    expect(SECTIONS.filter(([, tone]) => tone === "ink")).toHaveLength(1);
  });
});
