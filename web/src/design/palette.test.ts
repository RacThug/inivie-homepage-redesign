import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { contrastRatio } from "./contrast";
import { parseColorTokens } from "./tokens";

/**
 * The executable form of DESIGN-SYSTEM ch. 2.2.
 *
 * Contrast is checked against the real stylesheet, so editing a token to a
 * value that breaks WCAG AA fails the suite instead of reaching a reviewer.
 */

const AA_BODY = 4.5;

/** WCAG 2.2 SC 1.4.11, for a control's fill against the ground behind it. */
const NON_TEXT = 3;

const tokens = parseColorTokens(
  readFileSync(
    fileURLToPath(new URL("../app/globals.css", import.meta.url)),
    "utf8",
  ),
);

function ratio(foreground: string, background: string): number {
  return contrastRatio(tokens[foreground], tokens[background]);
}

describe("palette", () => {
  it("declares every token named in DESIGN-SYSTEM ch. 2.1", () => {
    expect(Object.keys(tokens).sort()).toEqual([
      "accent",
      "accent-hover",
      "border",
      "gold",
      "gold-dark",
      "ink",
      "ink-muted",
      "muted",
      "on-accent",
      "on-ink-muted",
      "surface",
      "surface-alt",
    ]);
  });

  /**
   * `accent` was `#ff8737` here until production's own Search button was
   * sampled pixel by pixel and came back `#fd6501`: the same hue 24 and
   * saturation, eleven points of lightness darker. The first draft had read
   * the accent off a lighter element and recorded it as the brand colour, so
   * every accented control on this site was a paler orange than the client's.
   */
  it("keeps the brand colours taken from production untouched", () => {
    expect(tokens.ink).toBe("#1c2434");
    expect(tokens.accent).toBe("#fd6501");
    expect(tokens.gold).toBe("#c9a779");
  });
});

describe("text pairings meet WCAG AA", () => {
  const pairings: ReadonlyArray<readonly [string, string]> = [
    ["ink", "surface"],
    ["ink-muted", "surface"],
    ["ink", "surface-alt"],
    ["ink-muted", "surface-alt"],
    ["surface", "ink"],
    // The ink pill of DESIGN-SYSTEM ch. 6.3, resting and hovered. The hover
    // fill lightens, so it is the one of the two that has to be measured.
    ["surface", "ink-muted"],
    ["gold", "ink"],
    ["on-ink-muted", "ink"],
    ["gold-dark", "surface"],
    ["gold-dark", "surface-alt"],
    // `on-accent` on `accent` is deliberately absent. It is the one pairing on
    // the site that does not clear AA, and the block below is where it is
    // recorded rather than quietly listed as passing here.
  ];

  it.each(pairings)("%s on %s clears 4.5 to 1", (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(AA_BODY);
  });
});

describe("the accent foreground decision", () => {
  /**
   * This is the one recorded deviation from WCAG AA on the site, and it is a
   * product decision rather than an oversight, so it is asserted here in the
   * shape it actually takes. A test that merely skipped the pairing would let
   * the numbers drift; these fail the moment somebody changes the fill without
   * revisiting the decision.
   *
   * The accent is production's own button colour. White on it measures 2.98 to
   * 1 against the 4.5 AA asks for, and the live site's button measures the same
   * because it is the same pairing. The redesign matches the client's control.
   */
  it("records that white on the accent falls short of AA", () => {
    expect(ratio("on-accent", "accent")).toBeCloseTo(2.98, 2);
    expect(ratio("on-accent", "accent")).toBeLessThan(AA_BODY);
  });

  it("resolves to white, which is production's own foreground", () => {
    expect(tokens["on-accent"]).toBe(tokens.surface);
  });

  /**
   * The hover fill is darker, so it moves toward AA rather than away from it.
   * Still short, but a state that degraded the resting contrast would be a
   * second defect on top of an accepted one.
   */
  it("keeps the hover fill no worse than the resting fill", () => {
    expect(ratio("on-accent", "accent-hover")).toBeCloseTo(3.73, 2);
    expect(ratio("on-accent", "accent-hover")).toBeGreaterThan(
      ratio("on-accent", "accent"),
    );
  });

  /**
   * The obvious rescue is ink text, which is what this token held before. It
   * does clear AA on the resting fill, and then fails on the hover fill at
   * 4.17, so swapping the foreground moves the failure rather than removing
   * it. Nothing carries text on `#e05a00` at AA. The fill is the constraint,
   * not the choice of foreground, and that is why white was allowed to stand.
   */
  it("shows ink would not rescue the pairing either", () => {
    expect(ratio("ink", "accent")).toBeGreaterThanOrEqual(AA_BODY);
    expect(ratio("ink", "accent-hover")).toBeLessThan(AA_BODY);
  });

  /**
   * The requirement the accent does meet. SC 1.4.11 asks a control's fill to
   * reach 3 to 1 against what is behind it, and the search panel and the
   * membership panel both put an accented button on `ink`. Deepening the
   * accent is what put this at risk: an earlier candidate, `#bd4b00`, hovered
   * to 2.45 there and would have sunk the button into the panel.
   */
  it("stays identifiable as a control on the ink panel", () => {
    expect(ratio("accent", "ink")).toBeGreaterThanOrEqual(NON_TEXT);
    expect(ratio("accent-hover", "ink")).toBeGreaterThanOrEqual(NON_TEXT);
  });
});

describe("secondary text on a dark ground", () => {
  /**
   * The footer is the first dark surface on the site, and it needs two levels
   * of text the way a light section does. The obvious shortcut is `surface` at
   * 70 per cent opacity, which composites to #bbbdc2 at 8.27 to 1. That works,
   * but it is a value nothing declares and nothing can check: change the ground
   * and the text silently changes with it. A real token is measurable.
   */
  it("clears AA against ink by a wide margin", () => {
    expect(ratio("on-ink-muted", "ink")).toBeCloseTo(7.7, 1);
  });

  it("stays clearly quieter than surface, or it would not be a second level", () => {
    expect(ratio("on-ink-muted", "ink")).toBeLessThan(ratio("surface", "ink"));
  });

  it("is a dark ground colour only, and fails on light as ink-muted's mirror", () => {
    expect(ratio("on-ink-muted", "surface")).toBeLessThan(AA_BODY);
  });
});

describe("colours that must never carry body text", () => {
  /**
   * Each of these fails AA on a light surface. The failure is the reason for
   * the usage restriction in DESIGN-SYSTEM ch. 2.1, so it is asserted rather
   * than left as prose somebody could overlook.
   */
  it.each([
    ["muted", "surface", "decorative and disabled states only"],
    ["accent", "surface", "a fill and marker colour, never text on light"],
    ["gold", "surface", "decorative on light, which is why gold-dark exists"],
    ["border", "surface", "separators only"],
  ])("%s on %s stays below AA: %s", (foreground, background) => {
    expect(ratio(foreground, background)).toBeLessThan(AA_BODY);
  });
});
