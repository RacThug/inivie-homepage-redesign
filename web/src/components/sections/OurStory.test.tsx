// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORY } from "@/content/story";

import { OurStory } from "./OurStory";

describe("OurStory", () => {
  it("tells all four chapters", () => {
    render(<OurStory />);

    for (const chapter of STORY.chapters) {
      expect(
        screen.getByRole("heading", { name: chapter.heading }),
      ).toBeInTheDocument();
      expect(screen.getByText(chapter.body)).toBeInTheDocument();
    }
  });

  /** Brief ch. 4.7: the four subsections are groupings of the eight mantras,
   *  which is what keeps the section true to the brand rather than generic
   *  about-us copy. All eight appear, and none of them twice. */
  it("carries all eight mantras, each exactly once", () => {
    render(<OurStory />);
    const mantras = STORY.chapters.flatMap((chapter) => chapter.mantras);

    expect(new Set(mantras).size).toBe(8);
    for (const mantra of mantras) {
      expect(screen.getByText(new RegExp(mantra))).toBeInTheDocument();
    }
  });

  /**
   * Brief ch. 4A. Production puts the same "Discover More" on all four of
   * these, which tells a visitor nothing about which of the four they are
   * about to open.
   */
  it("gives every chapter a control that names where it leads", () => {
    render(<OurStory />);

    for (const chapter of STORY.chapters) {
      expect(
        screen.getByRole("link", { name: chapter.action.label }),
      ).toHaveAttribute("href", chapter.action.href);
    }
  });

  it("shows the three photographs production has, and invents no fourth", () => {
    render(<OurStory />);

    expect(screen.getAllByRole("img")).toHaveLength(STORY.images.length);
  });
});
