// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeaturedPropertiesFrame } from "./FeaturedPropertiesFrame";

describe("FeaturedPropertiesFrame", () => {
  it("carries the section copy PRD ch. 6.2 specifies", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByText("Stay With Us")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Featured property for you" }),
    ).toBeInTheDocument();
  });

  /** A landmark named from the heading it already shows, rather than from a
   *  second copy of the words in an aria-label. */
  it("names the region from its own heading", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(
      screen.getByRole("region", { name: "Featured property for you" }),
    ).toBeInTheDocument();
  });

  /** PRD ch. 6.2: a filled ink pill, deliberately quieter than the accent
   *  fill a card's own call to action carries. */
  it("renders View All Family as an ink pill rather than a text link", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByRole("link", { name: "View All Family" })).toHaveClass(
      "bg-ink",
      "text-surface",
    );
  });

  it("puts whatever it is given below the header", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByText("Grid")).toBeInTheDocument();
  });

  /**
   * The pill follows the cards in the document and is pulled back onto the
   * heading row only from the desktop breakpoint. On a phone that puts the way
   * out of the section under the last card, where somebody who has just
   * scrolled past all of them is already looking, instead of back above the
   * first one.
   */
  describe("where the pill sits", () => {
    function placement() {
      const { container } = render(
        <FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>,
      );
      const pill = screen.getByRole("link", { name: "View All Family" });
      const cell = pill.parentElement!;
      const grid = cell.parentElement!;

      return { cell, cells: Array.from(grid.children), container };
    }

    it("follows the content on mobile and returns to the heading row on desktop", () => {
      const { cell } = placement();

      expect(cell).toHaveClass("order-last", "lg:order-none");
      expect(cell).toHaveClass("lg:col-start-2", "lg:row-start-1");
    });

    it("is one control in the document, not one per breakpoint", () => {
      placement();

      expect(
        screen.getAllByRole("link", { name: "View All Family" }),
      ).toHaveLength(1);
    });

    /** A grid cell stretches its child, and a full width ink pill would
     *  out-shout the accent button on every card below it. */
    it("keeps its own width rather than filling the phone", () => {
      const { cell } = placement();

      expect(cell).toHaveClass("justify-self-start");
    });

    it("sits between the header and the content in the document", () => {
      const { cell, cells } = placement();

      expect(cells.indexOf(cell)).toBe(1);
    });
  });
});
