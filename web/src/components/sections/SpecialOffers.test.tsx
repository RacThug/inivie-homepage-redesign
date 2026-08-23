// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OFFERS } from "@/content/offers";

import { SpecialOffers } from "./SpecialOffers";

describe("SpecialOffers", () => {
  /** Five, not four. The first tile spans two columns, so a wide one plus one
   *  fills the first row and three fill the second. Four would leave a hole in
   *  the bottom right corner (brief ch. 4.8). */
  it("shows five offers, the first one twice as wide on desktop", () => {
    render(<SpecialOffers />);
    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(5);
    expect(items[0]).toHaveClass("lg:col-span-2");
    expect(items[1]).not.toHaveClass("lg:col-span-2");
  });

  /**
   * These are production's own banners and the offer name is set into the
   * artwork. Printing it again underneath would be the "title twice on one
   * card" the brief ch. 7 rules out, so it is the link's accessible name
   * instead. Production ships all five with `alt="promo"`, which is what this
   * fixes.
   */
  describe("the title, which the artwork already carries", () => {
    it("names every link without printing the name a second time", () => {
      render(<SpecialOffers />);

      for (const offer of OFFERS.items) {
        expect(screen.getByRole("link", { name: offer.title })).toHaveAttribute(
          "href",
          offer.href,
        );
        expect(screen.queryByText(offer.title)).toBeNull();
      }
    });

    it("describes the photograph in the alternative text, not the offer", () => {
      render(<SpecialOffers />);

      for (const offer of OFFERS.items) {
        expect(screen.getByAltText(offer.imageAlt)).toBeInTheDocument();
      }
    });
  });

  /** A grid, not production's carousel: no script on the critical path, no
   *  items hidden from the first view, and no horizontal drag surface against
   *  vertical page scroll. Every offer is in the document from the start. */
  it("puts every offer in the first view rather than behind a control", () => {
    render(<SpecialOffers />);

    expect(screen.getAllByRole("img")).toHaveLength(OFFERS.items.length);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
