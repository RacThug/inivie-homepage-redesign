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
      "surface",
      "surface-alt",
    ]);
  });

  it("keeps the brand colours taken from production untouched", () => {
    expect(tokens.ink).toBe("#1c2434");
    expect(tokens.accent).toBe("#ff8737");
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
    ["gold", "ink"],
    ["gold-dark", "surface"],
    ["gold-dark", "surface-alt"],
    ["on-accent", "accent"],
    ["on-accent", "accent-hover"],
  ];

  it.each(pairings)("%s on %s clears 4.5 to 1", (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(AA_BODY);
  });
});

describe("the accent foreground decision", () => {
  /**
   * DESIGN-SYSTEM ch. 2.2 flagged white on a mid orange as the pairing most
   * likely to fail, and required it be measured rather than assumed. This is
   * that measurement, kept as a test so the decision cannot quietly rot.
   */
  it("records that white on accent falls short of AA", () => {
    expect(ratio("surface", "accent")).toBeCloseTo(2.39, 2);
    expect(ratio("surface", "accent")).toBeLessThan(AA_BODY);
  });

  it("resolves to ink text, the fallback ch. 2.2 names", () => {
    expect(tokens["on-accent"]).toBe(tokens.ink);
    expect(ratio("on-accent", "accent")).toBeCloseTo(6.49, 2);
  });

  /**
   * The hover fill is the darkest orange that still carries ink text at AA.
   * The value originally drafted, #e45826, reached only 4.23 to 1 and would
   * have dropped the button below AA for the whole time a pointer rested on
   * it.
   */
  it("keeps the hover fill above AA as well as the resting fill", () => {
    expect(ratio("on-accent", "accent-hover")).toBeCloseTo(4.85, 2);
    expect(contrastRatio("#1c2434", "#e45826")).toBeLessThan(AA_BODY);
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
