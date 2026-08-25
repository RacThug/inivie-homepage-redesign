// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Property } from "@/types/property";

import { PropertyCard } from "./PropertyCard";

/**
 * PRD ch. 6.2 lists eight things a card has to communicate, and two of them
 * are allowed to be missing. Those two are what the dynamic section exists to
 * prove, so they carry more tests here than the six that are always present.
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

function renderCard(overrides: Partial<Property> = {}) {
  return render(<PropertyCard property={{ ...leedon, ...overrides }} />);
}

describe("PropertyCard", () => {
  /**
   * DESIGN-SYSTEM ch. 6.1. The box is a fixed 4:3 and the photograph covers
   * it, so the card is always full and nothing in the payload moves where
   * the crop falls. The end to end suite reads the same rule off the
   * computed style, where a utility Tailwind failed to generate would show.
   */
  it("covers its box with the photograph", () => {
    renderCard();

    expect(screen.getByRole("img")).toHaveClass("object-cover");
  });

  it("renders the title as a heading", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Leedon Villa Seminyak" }),
    ).toBeInTheDocument();
  });

  it("renders the image with the alternative text the CMS supplies", () => {
    renderCard();

    expect(
      screen.getByAltText(
        "The private pool and garden terrace at Leedon Villa Seminyak",
      ),
    ).toBeInTheDocument();
  });

  it("renders the location and the excerpt", () => {
    renderCard();

    expect(screen.getByText("Seminyak, Bali")).toBeInTheDocument();
    expect(screen.getByText(leedon.excerpt)).toBeInTheDocument();
  });

  /** So a visitor can tell a resort from a villa without reading. */
  it("shows the category, cased for reading rather than as the stored value", () => {
    renderCard();

    expect(screen.getByText("villa")).toHaveClass("capitalize");
  });

  it("leads to the property destination", () => {
    renderCard();

    expect(
      screen.getByRole("link", {
        name: "View property, Leedon Villa Seminyak",
      }),
    ).toHaveAttribute("href", leedon.cta_url);
  });

  /**
   * WCAG 2.1 SC 2.5.3, Label in Name.
   *
   * Six cards all reading "View property" have to be told apart, and the
   * title was previously supplied as an `aria-label` that replaced the label
   * instead of extending it. That leaves a speech input user saying "click
   * view property" to a control that is no longer called that, which is the
   * exact failure the criterion is about. The title is now appended in text
   * that is only hidden visually, so the accessible name still opens with the
   * words on the button.
   */
  it("opens the accessible name with the words on the control", () => {
    renderCard();

    const link = screen.getByRole("link", {
      name: /^View property, /,
    });

    expect(link).toHaveTextContent("View property");
  });

  describe("rating", () => {
    /**
     * A bare "4.8" beside a star means nothing read aloud, so the scale is
     * spelled out in text that is hidden visually. The star is decorative.
     */
    it("shows one decimal, and says what the number is out of", () => {
      renderCard();

      expect(screen.getByText("out of 5").closest("p")).toHaveTextContent(
        "4.8 out of 5",
      );
    });

    it("still shows one decimal for a whole number", () => {
      renderCard({ rating: 5 });

      expect(screen.getByText("out of 5").closest("p")).toHaveTextContent(
        "5.0 out of 5",
      );
    });

    /** Rule D7. Never a zero, and never an empty star. */
    it("omits the rating entirely when there is none", () => {
      renderCard({ rating: null });

      expect(screen.queryByText("out of 5")).not.toBeInTheDocument();
    });
  });

  describe("price", () => {
    it("reads as a starting price with a currency and a per night qualifier", () => {
      renderCard();

      // Asserted on the row rather than on a node, because the amount and its
      // two qualifiers are separate spans: they are weighted differently.
      expect(screen.getByText("per night").closest("p")).toHaveTextContent(
        "From IDR 3,200,000 per night",
      );
    });

    it("uses whatever currency the CMS stored, not a hardcoded one", () => {
      renderCard({ price_from: 240, currency: "USD" });

      expect(screen.getByText("per night").closest("p")).toHaveTextContent(
        "From USD 240 per night",
      );
    });

    /** Rule D7: the whole row goes, not just the number. */
    it("omits the whole row when there is no price", () => {
      renderCard({ price_from: null });

      expect(screen.queryByText(/per night/)).not.toBeInTheDocument();
      expect(screen.queryByText(/From/)).not.toBeInTheDocument();
    });
  });

  /** DESIGN-SYSTEM ch. 6.1. Muted and non-interactive, never a link to
   *  nowhere, and the label stays so cards keep equal heights. */
  describe("when the CMS has set no destination", () => {
    it("renders the call to action inert rather than as a link", () => {
      renderCard({ cta_url: null });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("View property")).toHaveClass(
        "bg-border",
        "text-muted",
        "pointer-events-none",
      );
    });
  });

  /**
   * The equal height rule. Nothing here fixes a height: the title and excerpt
   * are clamped, and a growing spacer pushes the action to the bottom, so a
   * card missing its price row still ends level with its neighbours.
   */
  describe("equal height", () => {
    it("clamps the title to two lines and the excerpt to three", () => {
      renderCard();

      expect(screen.getByRole("heading", { name: leedon.title })).toHaveClass(
        "line-clamp-2",
      );
      expect(screen.getByText(leedon.excerpt)).toHaveClass("line-clamp-3");
    });

    it("pushes the price and the action to the bottom of the card", () => {
      renderCard();

      expect(screen.getByText("per night").closest("div")).toHaveClass(
        "mt-auto",
      );
    });
  });
});
