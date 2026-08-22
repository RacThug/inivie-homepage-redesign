import { describe, expect, it } from "vitest";

import { parseColorTokens } from "./tokens";

describe("parseColorTokens", () => {
  it("returns every colour token declared in the theme block", () => {
    const css = `
      @import "tailwindcss";

      @theme {
        --color-ink: #1c2434;
        --color-accent: #ff8737;
      }
    `;

    expect(parseColorTokens(css)).toEqual({
      ink: "#1c2434",
      accent: "#ff8737",
    });
  });

  it("keeps hyphenated token names intact", () => {
    const css = `@theme { --color-ink-muted: #4a5468; }`;

    expect(parseColorTokens(css)).toEqual({ "ink-muted": "#4a5468" });
  });

  it("ignores theme entries that are not colours", () => {
    const css = `
      @theme {
        --color-ink: #1c2434;
        --font-heading: var(--font-poppins);
        --radius-card: 12px;
      }
    `;

    expect(parseColorTokens(css)).toEqual({ ink: "#1c2434" });
  });

  it("supports the inline theme variant", () => {
    const css = `@theme inline { --color-ink: #1c2434; }`;

    expect(parseColorTokens(css)).toEqual({ ink: "#1c2434" });
  });

  // A colour defined outside the theme block is not a Tailwind token and
  // produces no utility class, so treating it as one would report a palette
  // that does not match the classes components can actually use.
  it("ignores colour declarations outside the theme block", () => {
    const css = `
      :root {
        --color-rogue: #ff0000;
      }

      @theme {
        --color-ink: #1c2434;
      }
    `;

    expect(parseColorTokens(css)).toEqual({ ink: "#1c2434" });
  });

  it("throws when the stylesheet declares no theme block", () => {
    expect(() => parseColorTokens(`:root { --color-ink: #1c2434; }`)).toThrow(
      /@theme/,
    );
  });
});

describe("parseColorTokens with references", () => {
  // A semantic token such as `on-accent` names a decision, but its value is
  // another token. Writing the hex twice would be the drift this parser exists
  // to prevent, so a reference is resolved to the value it points at.
  it("resolves a token declared as a reference to another token", () => {
    const css = `
      @theme {
        --color-ink: #1c2434;
        --color-on-accent: var(--color-ink);
      }
    `;

    expect(parseColorTokens(css)).toEqual({
      ink: "#1c2434",
      "on-accent": "#1c2434",
    });
  });

  it("resolves a reference declared before its target", () => {
    const css = `
      @theme {
        --color-on-accent: var(--color-ink);
        --color-ink: #1c2434;
      }
    `;

    expect(parseColorTokens(css)["on-accent"]).toBe("#1c2434");
  });

  it("throws when a reference points at a token that does not exist", () => {
    const css = `@theme { --color-on-accent: var(--color-absent); }`;

    expect(() => parseColorTokens(css)).toThrow(/--color-absent/);
  });

  it("throws when references form a cycle", () => {
    const css = `
      @theme {
        --color-a: var(--color-b);
        --color-b: var(--color-a);
      }
    `;

    expect(() => parseColorTokens(css)).toThrow(/circular/i);
  });
});
