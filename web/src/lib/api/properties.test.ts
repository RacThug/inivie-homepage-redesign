import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Property } from "@/types/property";

import { fetchProperties } from "./properties";

/**
 * The failure paths matter more here than the happy one. F5 is the reason this
 * module exists in the shape it does: a section that cannot reach the CMS has
 * to come back with an empty list and a flag, never with a thrown error, or a
 * single unreachable endpoint takes the whole homepage down with it.
 */

const BASE = "http://localhost:8000";

const leedon: Property = {
  id: 1,
  title: "Leedon Villa Seminyak",
  slug: "leedon-villa-seminyak",
  category: "villa",
  location: "Seminyak, Bali",
  excerpt:
    "A walled garden villa two streets back from Petitenget beach, with a private pool and a full kitchen.",
  image_url: "http://localhost:8000/storage/properties/leedon.webp",
  image_alt: "The private pool and garden terrace at Leedon Villa Seminyak",
  price_from: 3_200_000,
  currency: "IDR",
  rating: 4.8,
  cta_url: "https://inivie.com/properties/leedon-villa-seminyak",
  sort_order: 1,
};

function respondWith(body: unknown, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

function calledUrl(): URL {
  const [input] = vi.mocked(fetch).mock.calls[0];

  return new URL(String(input));
}

beforeEach(() => {
  vi.stubEnv("CMS_API_URL", BASE);
  // Server side logging is the point of the failure paths, not noise the
  // suite should print. Silenced, then asserted on where it matters.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchProperties", () => {
  it("calls the documented endpoint with the limit it was given", async () => {
    vi.stubGlobal("fetch", respondWith({ data: [leedon], meta: { count: 1 } }));

    await fetchProperties(3);

    const url = calledUrl();
    expect(url.origin).toBe(BASE);
    expect(url.pathname).toBe("/api/v1/properties");
    expect(url.searchParams.get("limit")).toBe("3");
  });

  it("caches the read for 60 seconds under the properties tag", async () => {
    vi.stubGlobal("fetch", respondWith({ data: [], meta: { count: 0 } }));

    await fetchProperties(3);

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init).toMatchObject({
      next: { revalidate: 60, tags: ["properties"] },
    });
  });

  it("gives up after 5 seconds rather than holding the homepage", async () => {
    vi.stubGlobal("fetch", respondWith({ data: [], meta: { count: 0 } }));

    await fetchProperties(3);

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns the properties the API sent, in the order it sent them", async () => {
    const second = { ...leedon, id: 2, title: "Ajowa Resort", sort_order: 2 };
    vi.stubGlobal(
      "fetch",
      respondWith({ data: [leedon, second], meta: { count: 2 } }),
    );

    const result = await fetchProperties(3);

    expect(result.properties.map((property) => property.title)).toEqual([
      "Leedon Villa Seminyak",
      "Ajowa Resort",
    ]);
    expect(result.unavailable).toBe(false);
  });

  /**
   * F4, and the reason the result carries a flag rather than just a list.
   * Nothing published is a valid answer, and the section hides itself. It is
   * not the same event as the CMS being unreachable, which shows a fallback.
   */
  it("reports an empty result as available, because zero published is valid", async () => {
    vi.stubGlobal("fetch", respondWith({ data: [], meta: { count: 0 } }));

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: false });
  });

  it.each([404, 422, 429, 500, 503])(
    "reports %i as unavailable instead of throwing",
    async (status) => {
      vi.stubGlobal("fetch", respondWith({ message: "no" }, status));

      const result = await fetchProperties(3);

      expect(result).toEqual({ properties: [], unavailable: true });
      expect(console.error).toHaveBeenCalled();
    },
  );

  it("reports a network failure as unavailable instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: true });
    expect(console.error).toHaveBeenCalled();
  });

  it("reports a timeout as unavailable instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation timed out", "TimeoutError");
      }),
    );

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: true });
  });

  /**
   * The production defect in PRD ch. 2.3 is a consumer trusting a payload the
   * API never promised. A body that is not the documented envelope is treated
   * as the API being unavailable, which it effectively is.
   */
  it("treats a body that is not the documented envelope as unavailable", async () => {
    vi.stubGlobal("fetch", respondWith({ properties: [leedon] }));

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: true });
    expect(console.error).toHaveBeenCalled();
  });

  /**
   * The envelope alone is not enough. A renamed or dropped field arrives as
   * an array of objects, passes an `Array.isArray` test, and reaches a card
   * as `undefined` in the markup, which is precisely the defect in PRD
   * ch. 2.3 and precisely what nobody noticed in production.
   */
  describe("when a property is not the documented shape", () => {
    it.each([
      ["a field the contract requires is missing", { image_alt: undefined }],
      ["a field arrives with the wrong type", { price_from: "3200000" }],
      ["a non-nullable field arrives null", { image_url: null }],
      ["the category is outside the enum", { category: "glamping" }],
      ["an object arrives where a property should be", { id: {} }],
    ])("refuses the response when %s", async (_case, damage) => {
      vi.stubGlobal(
        "fetch",
        respondWith({ data: [{ ...leedon, ...damage }], meta: { count: 1 } }),
      );

      const result = await fetchProperties(3);

      expect(result).toEqual({ properties: [], unavailable: true });
      expect(console.error).toHaveBeenCalled();
    });

    it("refuses the whole response, not just the property at fault", async () => {
      vi.stubGlobal(
        "fetch",
        respondWith({
          data: [leedon, { ...leedon, id: "2" }],
          meta: { count: 2 },
        }),
      );

      const result = await fetchProperties(3);

      // Rendering the half that still parses would hide the drift behind a
      // page that looks fine, which is the failure mode being defended against.
      expect(result.properties).toEqual([]);
    });

    /** Additive change to the payload must not be a breaking one. */
    it("accepts a property carrying a field this side has not heard of", async () => {
      vi.stubGlobal(
        "fetch",
        respondWith({
          data: [{ ...leedon, badge: "New Opening" }],
          meta: { count: 1 },
        }),
      );

      const result = await fetchProperties(3);

      expect(result.unavailable).toBe(false);
      expect(result.properties).toHaveLength(1);
    });

    it("accepts the nullable fields at null, which is a documented state", async () => {
      vi.stubGlobal(
        "fetch",
        respondWith({
          data: [{ ...leedon, price_from: null, rating: null, cta_url: null }],
          meta: { count: 1 },
        }),
      );

      const result = await fetchProperties(3);

      expect(result.unavailable).toBe(false);
    });
  });

  it("treats a missing meta count as unavailable", async () => {
    vi.stubGlobal("fetch", respondWith({ data: [] }));

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: true });
  });

  it("treats an unparseable body as unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>gateway</html>", { status: 200 })),
    );

    const result = await fetchProperties(3);

    expect(result).toEqual({ properties: [], unavailable: true });
  });

  describe("configuration", () => {
    it("is unavailable, not broken, when the base URL is unset", async () => {
      vi.stubEnv("CMS_API_URL", "");
      const fetchSpy = respondWith({ data: [], meta: { count: 0 } });
      vi.stubGlobal("fetch", fetchSpy);

      const result = await fetchProperties(3);

      expect(result).toEqual({ properties: [], unavailable: true });
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("is unavailable, not broken, when the base URL is not a URL", async () => {
      vi.stubEnv("CMS_API_URL", "localhost:8000");
      vi.stubGlobal("fetch", respondWith({ data: [], meta: { count: 0 } }));

      const result = await fetchProperties(3);

      expect(result).toEqual({ properties: [], unavailable: true });
    });

    it("tolerates a base URL with a trailing slash", async () => {
      vi.stubEnv("CMS_API_URL", `${BASE}/`);
      vi.stubGlobal("fetch", respondWith({ data: [], meta: { count: 0 } }));

      await fetchProperties(3);

      expect(calledUrl().pathname).toBe("/api/v1/properties");
    });
  });
});
