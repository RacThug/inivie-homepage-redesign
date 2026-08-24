import { describe, expect, it } from "vitest";

import type { Property, PropertyListResponse } from "./property";

/**
 * The frontend half of the contract test. Its CMS counterpart is
 * `cms/tests/Feature/Api/V1/PropertyIndexTest.php`, which asserts the
 * same key list against a real response.
 *
 * The pin works in two steps. `tsc` locks each fixture to the `Property`
 * interface: a field added to the interface makes the fixture incomplete,
 * and a field removed from it makes the fixture's literal excessive.
 * These assertions then lock the fixtures to the list written out in
 * docs/API-SPEC.md ch. 3.3. So the interface cannot drift from the
 * documented payload without one of the two failing.
 */
const CONTRACT_KEYS = [
  "id",
  "title",
  "slug",
  "category",
  "location",
  "excerpt",
  "image_url",
  "image_alt",
  "image_focus",
  "price_from",
  "currency",
  "rating",
  "cta_url",
  "sort_order",
];

const populated: Property = {
  id: 1,
  title: "Leedon Villa Seminyak",
  slug: "leedon-villa-seminyak",
  category: "villa",
  location: "Seminyak, Bali",
  excerpt: "Private pool villa steps away from Seminyak beach.",
  image_url:
    "http://localhost:8000/storage/properties/leedon-villa-seminyak.webp",
  image_alt: "Private pool at Leedon Villa Seminyak at dusk",
  image_focus: "center",
  price_from: 3_200_000,
  currency: "IDR",
  rating: 4.8,
  cta_url: "https://inivie.com/properties/leedon-villa-seminyak",
  sort_order: 10,
};

/** The same property with every nullable field at null, per P8. */
const sparse: Property = {
  ...populated,
  price_from: null,
  rating: null,
  cta_url: null,
};

describe("Property", () => {
  it("declares exactly the fields the API returns", () => {
    expect(Object.keys(populated)).toEqual(CONTRACT_KEYS);
  });

  it("keeps the nullable fields present and null rather than absent", () => {
    expect(Object.keys(sparse)).toEqual(CONTRACT_KEYS);
    expect(sparse.price_from).toBeNull();
    expect(sparse.rating).toBeNull();
    expect(sparse.cta_url).toBeNull();
  });
});

describe("PropertyListResponse", () => {
  it("wraps the list in an object alongside a count", () => {
    const response: PropertyListResponse = {
      data: [populated, sparse],
      meta: { count: 2 },
    };

    expect(Object.keys(response)).toEqual(["data", "meta"]);
    expect(response.meta.count).toBe(response.data.length);
  });

  it("represents an empty result as an empty array, not an absent one", () => {
    const empty: PropertyListResponse = { data: [], meta: { count: 0 } };

    expect(empty.data).toEqual([]);
  });
});
