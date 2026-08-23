// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CulinaryJourney } from "./CulinaryJourney";
import { WellnessEscape } from "./WellnessEscape";

/**
 * The brief ch. 4.5 asks that Culinary and Wellness read as a pair. They are
 * one component with two content modules, so what is worth asserting is that
 * each arrives whole and that the two really do stay the same shape.
 */
describe("the venue sections", () => {
  it.each([
    ["The Culinary Journey", CulinaryJourney, "Wonderspace", "All restaurants"],
    ["Wellness Harmony Escape", WellnessEscape, "Svaha Wellness", "All spas"],
  ])("%s carries its own copy", (heading, Component, eyebrow, action) => {
    render(<Component />);

    expect(screen.getByText(eyebrow)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: action })).toBeInTheDocument();
  });

  it("each shows three venues", () => {
    render(<CulinaryJourney />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  /** Every heading on the page is an h2 for the section and an h3 for its
   *  cards, so a reader never meets a skipped level. */
  it("puts venue names a level below the section heading", () => {
    render(<WellnessEscape />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  /** The grounds alternate down the page, and these two are neighbours. */
  it("do not sit on the same ground as each other", () => {
    const culinary = render(<CulinaryJourney />).container.firstElementChild;
    const wellness = render(<WellnessEscape />).container.firstElementChild;

    expect(culinary).toHaveClass("bg-surface-alt");
    expect(wellness).not.toHaveClass("bg-surface-alt");
  });
});
