import { afterEach, describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

const original = process.env.SITE_URL;

afterEach(() => {
  process.env.SITE_URL = original;
});

describe("robots.txt", () => {
  it("lets a crawler have the whole site", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("points at the sitemap on the configured host", () => {
    process.env.SITE_URL = "https://inivie.com";

    expect(robots().sitemap).toBe("https://inivie.com/sitemap.xml");
    expect(robots().host).toBe("https://inivie.com/");
  });
});

describe("sitemap.xml", () => {
  /**
   * The homepage, and nothing else. The rest of inivie.com is production's
   * and is not served from this application, so listing it would point a
   * crawler at pages that are not here.
   */
  it("lists the one route this application builds", () => {
    process.env.SITE_URL = "https://inivie.com";

    const entries = sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://inivie.com/");
  });

  it("agrees with robots.txt about where the site lives", () => {
    process.env.SITE_URL = "https://inivie.com";

    // A canonical, a sitemap and a robots host that name different origins
    // are worse than none of them: each one tells a crawler the others lied.
    expect(new URL(sitemap()[0].url).origin).toBe(
      new URL(robots().sitemap as string).origin,
    );
  });
});
