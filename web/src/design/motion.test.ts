import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * The executable form of DESIGN-SYSTEM ch. 5.
 *
 * The motion tokens are not referenced by any component yet, so Tailwind tree
 * shakes them out of the compiled stylesheet and they cannot be checked there.
 * They are checked at the source instead, which is also where the ch. 5 limits
 * are expressed.
 */

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

const REM = 16;

function toPixels(length: string): number {
  const value = Number.parseFloat(length);

  return length.trim().endsWith("rem") ? value * REM : value;
}

describe("motion", () => {
  it("runs at the 200ms duration from ch. 5", () => {
    expect(css).toMatch(/--default-transition-duration:\s*200ms;/);
  });

  it("eases out", () => {
    expect(css).toMatch(
      /--default-transition-timing-function:\s*var\(--ease-out\);/,
    );
  });

  it("gives the scroll entrance the same duration and easing", () => {
    expect(css).toMatch(/--animate-enter:\s*enter 200ms var\(--ease-out\)/);
  });

  it("keeps the entrance translate within the 12px ceiling", () => {
    const translate = /translateY\(([^)]+)\)/.exec(css);

    expect(translate).not.toBeNull();
    expect(toPixels(translate![1])).toBeLessThanOrEqual(12);
  });

  /**
   * ch. 5 calls this a hard requirement rather than a nicety, because
   * vestibular sensitivity is an accessibility concern and not a preference.
   */
  it("disables animation under prefers-reduced-motion", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(css).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});
