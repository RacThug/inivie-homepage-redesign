// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FEATURED_PROPERTY_COUNT } from "@/content/featured-properties";
import type { PropertiesResult } from "@/lib/api/properties";
import { fetchProperties } from "@/lib/api/properties";
import type { Property } from "@/types/property";

import { FeaturedPropertiesContent } from "./FeaturedPropertiesContent";

vi.mock("@/lib/api/properties", () => ({ fetchProperties: vi.fn() }));

/**
 * F1 to F5 land here. Ordering and publish state are the CMS's job and are
 * asserted in its own suite, so what is checked here is that the frontend
 * takes the API at its word and does the right thing with each of the three
 * answers it can get.
 */

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

function property(id: number, title: string): Property {
  return { ...leedon, id, title, sort_order: id };
}

function answers(result: PropertiesResult) {
  vi.mocked(fetchProperties).mockResolvedValue(result);
}

async function renderSection() {
  return render(await FeaturedPropertiesContent());
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("FeaturedPropertiesContent", () => {
  it("asks for the number of cards the section is specified to show", async () => {
    answers({ properties: [leedon], unavailable: false });

    await renderSection();

    expect(fetchProperties).toHaveBeenCalledWith(FEATURED_PROPERTY_COUNT);
  });

  it("renders a card per property, in the order the API sent them", async () => {
    answers({
      properties: [
        property(1, "Leedon Villa Seminyak"),
        property(2, "Ajowa Resort"),
        property(3, "La Mewali Resort"),
      ],
      unavailable: false,
    });

    await renderSection();

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Leedon Villa Seminyak", "Ajowa Resort", "La Mewali Resort"]);
  });

  /** F3. Six is what the section asks for, and none of them may be dropped.
   *  Counted by card rather than by list item: the carousel has a second list
   *  of its own, one dot per card, and counting both would pass at twelve. */
  it("renders six cards without dropping any", async () => {
    answers({
      properties: Array.from({ length: 6 }, (_, index) =>
        property(index + 1, `Property ${index + 1}`),
      ),
      unavailable: false,
    });

    await renderSection();

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  /** F4. The heading goes with the grid, leaving no empty gap. */
  it("renders nothing at all when the CMS has nothing published", async () => {
    answers({ properties: [], unavailable: false });

    const { container } = await renderSection();

    expect(container).toBeEmptyDOMElement();
  });

  /** F5, and A14. The section degrades, the page does not. */
  describe("when the API cannot be read", () => {
    it("keeps the section and shows a short line in place of the grid", async () => {
      answers({ properties: [], unavailable: true });

      await renderSection();

      expect(
        screen.getByRole("heading", { name: "Featured property for you" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/cannot be shown right now/)).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("says nothing about why, because a visitor cannot act on a status code", async () => {
      answers({ properties: [], unavailable: true });

      await renderSection();

      expect(screen.queryByText(/error|failed|500/i)).not.toBeInTheDocument();
    });

    it("still offers the way through to the rest of the portfolio", async () => {
      answers({ properties: [], unavailable: true });

      await renderSection();

      expect(
        screen.getByRole("link", { name: "View All Family" }),
      ).toHaveAttribute("href", "/stay");
    });
  });
});
