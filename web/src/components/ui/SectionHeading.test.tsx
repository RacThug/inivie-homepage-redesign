// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("renders the eyebrow, heading, and intro", () => {
    render(
      <SectionHeading
        eyebrow="Stay with us"
        heading="Featured properties"
        intro="A selection of our resorts, villas, and hotels."
      />,
    );

    expect(screen.getByText("Stay with us")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Featured properties" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A selection of our resorts, villas, and hotels."),
    ).toBeInTheDocument();
  });

  it("omits the intro paragraph when there is none", () => {
    const { container } = render(
      <SectionHeading eyebrow="Stay with us" heading="Featured properties" />,
    );

    expect(container.querySelector("p")).toBeNull();
  });

  it("renders an h2 by default, since the page has one h1", () => {
    render(<SectionHeading eyebrow="Stay with us" heading="Featured" />);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("can render at another level, so headings never skip a step", () => {
    render(<SectionHeading eyebrow="Stay" heading="Featured" level={3} />);

    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  /**
   * `gold` fails AA on a light surface at 2.26 to 1, so the eyebrow uses the
   * darkened token instead. Asserting it here ties the palette measurement to
   * the one component that renders gold as text.
   */
  it("sets the eyebrow in the AA-safe gold", () => {
    render(<SectionHeading eyebrow="Stay with us" heading="Featured" />);

    expect(screen.getByText("Stay with us")).toHaveClass("text-gold-dark");
  });

  it("caps the intro at the measure from DESIGN-SYSTEM ch. 3.3", () => {
    render(
      <SectionHeading eyebrow="Stay" heading="Featured" intro="Some copy." />,
    );

    expect(screen.getByText("Some copy.")).toHaveClass("max-w-measure");
  });

  describe("the optional action", () => {
    it("renders after the heading, so it falls below the copy on mobile", () => {
      const { container } = render(
        <SectionHeading
          eyebrow="Stay"
          heading="Featured"
          action={<a href="/properties">See all</a>}
        />,
      );
      const [copy, action] = Array.from(container.firstElementChild!.children);

      expect(copy).toContainElement(screen.getByRole("heading"));
      expect(action).toContainElement(screen.getByRole("link"));
    });

    it("moves onto the heading row only from the desktop breakpoint", () => {
      const { container } = render(
        <SectionHeading
          eyebrow="Stay"
          heading="Featured"
          action={<a href="/properties">See all</a>}
        />,
      );

      expect(container.firstElementChild).toHaveClass(
        "flex-col",
        "lg:flex-row",
        "lg:items-end",
        "lg:justify-between",
      );
    });
  });
});
