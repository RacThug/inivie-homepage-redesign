// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyCardSkeleton } from "./PropertyCardSkeleton";

/**
 * DESIGN-SYSTEM ch. 6.6 asks for dimensions that match the real card exactly.
 * What can be checked here is that the skeleton is built from the same pieces
 * as the card: the same 4:3 image, the same clamped line counts, and the same
 * type scale on each line, which is what makes the heights agree.
 */
describe("PropertyCardSkeleton", () => {
  function renderSkeleton() {
    const { container } = render(<PropertyCardSkeleton />);

    return container;
  }

  it("reserves the same 4:3 image the real card has", () => {
    expect(
      renderSkeleton().querySelector('[class~="aspect-4/3"]'),
    ).not.toBeNull();
  });

  it("reserves two title lines at the title's own scale", () => {
    const lines = renderSkeleton().querySelectorAll(".text-h3");

    expect(lines).toHaveLength(2);
  });

  it("reserves three excerpt lines and one price line at the body scale", () => {
    const lines = renderSkeleton().querySelectorAll(".text-body");

    expect(lines).toHaveLength(4);
  });

  it("reserves the button's 44px minimum, so the foot of the card lines up", () => {
    expect(renderSkeleton().querySelector(".h-11")).not.toBeNull();
  });

  /**
   * The block a clamped paragraph occupies is N line boxes and nothing else.
   * A margin between the placeholder lines would make the skeleton taller
   * than the card it is holding space for, by 4px for every gap.
   */
  it("leaves no gap between the lines of one block", () => {
    const lines = renderSkeleton().querySelectorAll(".text-h3, .text-body");

    for (const line of lines) {
      expect(line.className).not.toMatch(/(^|\s)mt-1(\s|$)/);
    }
  });

  it("matches the real button's width at each breakpoint, not just its height", () => {
    const button = renderSkeleton().querySelector(".h-11");

    expect(button).toHaveClass("w-full", "sm:w-34");
  });

  it("has nothing to read, so it is hidden from assistive technology", () => {
    expect(renderSkeleton().firstElementChild).toHaveAttribute("aria-hidden");
  });
});
