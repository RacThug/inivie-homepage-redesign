import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("accepts shorthand, lowercase, and unprefixed hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#FfF")).toBeCloseTo(1, 5);
  });

  it("rejects anything that is not a hex colour", () => {
    expect(() => relativeLuminance("rgb(0,0,0)")).toThrow();
    expect(() => relativeLuminance("#12345")).toThrow();
    expect(() => relativeLuminance("#GGGGGG")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("returns the WCAG maximum of 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("returns 1 when both colours are identical", () => {
    expect(contrastRatio("#FF8737", "#FF8737")).toBeCloseTo(1, 5);
  });

  it("is symmetric, since contrast has no foreground or background", () => {
    expect(contrastRatio("#1C2434", "#F7F7F5")).toBeCloseTo(
      contrastRatio("#F7F7F5", "#1C2434"),
      10,
    );
  });

  // #767676 is the canonical darkest grey that still clears 4.5 to 1 on white.
  // It anchors the implementation against a value published by the WCAG
  // working group rather than one this project computed for itself.
  it("matches the published ratio for the WCAG boundary grey", () => {
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });

  it("matches the published ratio for mid grey on white", () => {
    expect(contrastRatio("#808080", "#FFFFFF")).toBeCloseTo(3.95, 2);
  });
});
