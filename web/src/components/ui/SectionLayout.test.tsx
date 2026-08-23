// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionLayout } from "./SectionLayout";

const ACTION = { label: "All restaurants", href: "/dine" };

function layout() {
  return render(
    <SectionLayout
      action={ACTION}
      eyebrow="Wonderspace"
      heading="The Culinary Journey"
      headingId="culinary"
    >
      Grid
    </SectionLayout>,
  );
}

describe("SectionLayout", () => {
  it("carries the section copy and the content it is given", () => {
    layout();

    expect(screen.getByText("Wonderspace")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The Culinary Journey" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Grid")).toBeInTheDocument();
  });

  it("gives the heading the id a landmark can point at", () => {
    layout();

    expect(screen.getByRole("heading")).toHaveAttribute("id", "culinary");
  });

  it("renders no control at all where a section leads nowhere", () => {
    render(
      <SectionLayout eyebrow="Good to Know" heading="FAQ" headingId="faq">
        Rows
      </SectionLayout>,
    );

    expect(screen.queryByRole("link")).toBeNull();
  });

  /**
   * DESIGN-SYSTEM ch. 6.2. The control follows the cards in the document and
   * is pulled back onto the heading row only from the desktop breakpoint. On a
   * phone that puts the way out of the section under the last card, where
   * somebody who has just scrolled past all of them is already looking,
   * instead of back above the first one.
   */
  describe("where the control sits", () => {
    function placement() {
      layout();
      const control = screen.getByRole("link", { name: ACTION.label });
      const cell = control.parentElement!;

      return { cell, cells: Array.from(cell.parentElement!.children) };
    }

    it("follows the content on mobile and returns to the heading row on desktop", () => {
      const { cell } = placement();

      expect(cell).toHaveClass("order-last", "lg:order-none");
      expect(cell).toHaveClass("lg:col-start-2", "lg:row-start-1");
    });

    it("is one control in the document, not one per breakpoint", () => {
      placement();

      expect(screen.getAllByRole("link", { name: ACTION.label })).toHaveLength(
        1,
      );
    });

    /** A grid cell stretches its child, and a full width pill on a phone would
     *  out-shout the call to action on every card below it. */
    it("keeps its own width rather than filling the phone", () => {
      const { cell } = placement();

      expect(cell).toHaveClass("justify-self-start");
    });

    it("sits between the header and the content in the document", () => {
      const { cell, cells } = placement();

      expect(cells.indexOf(cell)).toBe(1);
    });
  });

  /**
   * The ten static sections take the outlined control, one step quieter than
   * the ink pill PRD ch. 6.2 asks for on Featured Properties by name, so the
   * dynamic section stays the loud one.
   */
  describe("which control a section gets", () => {
    it("is outlined unless the section asks for otherwise", () => {
      layout();

      expect(screen.getByRole("link", { name: ACTION.label })).toHaveClass(
        "border-ink",
      );
    });

    it("can be the ink pill", () => {
      render(
        <SectionLayout
          action={ACTION}
          actionVariant="ink"
          eyebrow="Stay With Us"
          heading="Featured property for you"
          headingId="featured-properties"
        >
          Grid
        </SectionLayout>,
      );

      expect(screen.getByRole("link", { name: ACTION.label })).toHaveClass(
        "bg-ink",
        "text-surface",
      );
    });
  });
});
