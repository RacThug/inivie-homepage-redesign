import { afterEach, describe, expect, it } from "vitest";

import { siteOrigin, siteUrl } from "./site";

const original = process.env.SITE_URL;

afterEach(() => {
  process.env.SITE_URL = original;
});

describe("siteOrigin", () => {
  it("reads the configured origin", () => {
    process.env.SITE_URL = "https://inivie.com";

    expect(siteOrigin()).toBe("https://inivie.com");
  });

  it("keeps the origin and drops everything after it", () => {
    // A canonical URL is built from this, so a path left on the end would be
    // repeated in every one of them.
    process.env.SITE_URL = "https://inivie.com/home/?utm=x";

    expect(siteOrigin()).toBe("https://inivie.com");
  });

  it.each([
    ["unset", undefined],
    ["empty", "   "],
    ["missing its scheme", "inivie.com"],
  ])("falls back to localhost when it is %s", (_case, value) => {
    // Loudly wrong in the emitted canonical, rather than a build that refuses
    // to produce a page because a metadata value was mistyped.
    if (value === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = value;
    }

    expect(siteOrigin()).toBe("http://localhost:3000");
  });
});

describe("siteUrl", () => {
  it("resolves a path against the origin", () => {
    process.env.SITE_URL = "https://inivie.com";

    expect(siteUrl("/sitemap.xml")).toBe("https://inivie.com/sitemap.xml");
  });

  it("is the origin itself by default", () => {
    process.env.SITE_URL = "https://inivie.com";

    expect(siteUrl()).toBe("https://inivie.com/");
  });
});
