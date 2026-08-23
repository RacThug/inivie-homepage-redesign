// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FEATURED_IN } from "@/content/featured-in";

import { FeaturedIn } from "./FeaturedIn";

describe("FeaturedIn", () => {
  /**
   * The correction this section exists to make. Production serves nine logo
   * files with no alternative text at all, so a screen reader is handed nine
   * images and told nothing; every mark here is named, and the one whose owner
   * could not be established is not here at all.
   */
  it("names every mark it shows", () => {
    render(<FeaturedIn />);

    expect(
      screen.getAllByRole("img").map((mark) => mark.getAttribute("alt")),
    ).toEqual(FEATURED_IN.publications.map((p) => p.name));
  });

  /**
   * The ribbon holds the eight marks twice, because a track translated by half
   * its own width is a loop with no seam. Only the first copy is in the
   * accessibility tree: read both and the row claims sixteen publications.
   *
   * Asserted through `getAllByRole`, which honours `aria-hidden`, against the
   * raw `alt` attributes, which do not. The gap between those two numbers is
   * the whole of the mechanism.
   */
  it("does not read the copy that carries the loop", () => {
    const { container } = render(<FeaturedIn />);

    expect(container.querySelectorAll("img")).toHaveLength(
      FEATURED_IN.publications.length * 2,
    );
    expect(screen.getAllByRole("img")).toHaveLength(
      FEATURED_IN.publications.length,
    );
  });

  it("shows no unnamed mark", () => {
    render(<FeaturedIn />);

    for (const logo of screen.getAllByRole("img")) {
      expect(logo).toHaveAccessibleName();
    }
  });

  /**
   * `overflow-hidden` is what makes the track a ribbon, and it clips both
   * axes. With the window exactly as tall as the row, a mark that lifts on
   * hover had its top cut off and its shadow cut off underneath it. The
   * padding is the room those need and the margins take it back out of the
   * layout, so all three belong together: remove any one and the row either
   * clips again or moves.
   *
   * Asserted as classes because there is nothing else to assert it as. jsdom
   * lays nothing out, so the clipping this prevents cannot be measured here;
   * what a test can do is say why the classes are there.
   */
  it("leaves the row room to lift into", () => {
    const { container } = render(<FeaturedIn />);

    const window = container.querySelector(".overflow-hidden");

    expect(window).toHaveClass("py-3", "mt-3", "-mb-3");
  });

  /** None of these is a link on production either, and inventing outbound URLs
   *  to make the row feel interactive would be inventing facts. */
  it("claims nothing beyond having been written about", () => {
    render(<FeaturedIn />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  /**
   * The label is the heading. Production and the design pass both give this
   * section one small line and nothing under it, so there is no sentence to
   * write here, and a landmark still has to be named by something a reader can
   * see rather than by an `aria-label` nobody else gets.
   */
  describe("its header", () => {
    it("is the label and nothing else", () => {
      render(<FeaturedIn />);

      expect(
        screen.getByRole("heading", { name: FEATURED_IN.heading }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("names the region from it", () => {
      render(<FeaturedIn />);

      expect(
        screen.getByRole("region", { name: FEATURED_IN.heading }),
      ).toBeInTheDocument();
    });
  });
});
