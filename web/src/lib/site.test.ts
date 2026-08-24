import { afterEach, describe, expect, it } from "vitest";

import { siteOrigin, siteUrl } from "./site";

const original = process.env.SITE_URL;

afterEach(() => {
  /*
    Deleted rather than assigned back when there was nothing there. Assigning
    `undefined` to a key of `process.env` stores the five character string
    "undefined", which is neither unset nor a URL, and the next test in the
    file would read it as a malformed value.
  */
  if (original === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = original;
  }
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
  ])("falls back to localhost when it is %s", (_case, value) => {
    // The local case, and the only one where an absent value is an answer
    // rather than a mistake.
    if (value === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = value;
    }

    expect(siteOrigin()).toBe("http://localhost:3000");
  });

  /**
   * Set but unparseable is a typo, and the failure to avoid is the quiet one:
   * a deployment whose canonical, sitemap and sharing card all point at
   * localhost, with nothing saying so until a crawler has believed it.
   */
  it("refuses a value that is not a URL", () => {
    process.env.SITE_URL = "inivie.com";

    expect(() => siteOrigin()).toThrow(/SITE_URL is not a URL/);
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
