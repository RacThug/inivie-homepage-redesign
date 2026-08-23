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

    expect(screen.getAllByRole("img")).toHaveLength(
      FEATURED_IN.publications.length,
    );
    for (const publication of FEATURED_IN.publications) {
      expect(screen.getByAltText(publication.name)).toBeInTheDocument();
    }
  });

  it("shows no unnamed mark", () => {
    render(<FeaturedIn />);

    for (const logo of screen.getAllByRole("img")) {
      expect(logo).toHaveAccessibleName();
    }
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
