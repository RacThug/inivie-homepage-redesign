// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Contents</Card>);

    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("carries the surface, border, radius, and rest elevation from ch. 6.1", () => {
    const { container } = render(<Card>Contents</Card>);

    expect(container.firstElementChild).toHaveClass(
      "bg-surface",
      "border",
      "border-border",
      "rounded-card",
      "shadow-rest",
    );
  });

  it("lifts to the raised elevation on hover", () => {
    const { container } = render(<Card>Contents</Card>);

    expect(container.firstElementChild).toHaveClass("hover:shadow-raised");
  });

  /**
   * The equal height rule in ch. 6.1 is met by letting the card fill its grid
   * cell and laying its content out as a column, so a footer action can be
   * pushed to the bottom. Fixing a height would clip long titles instead.
   */
  it("fills its grid cell and stacks its content as a column", () => {
    const { container } = render(<Card>Contents</Card>);

    expect(container.firstElementChild).toHaveClass(
      "flex",
      "h-full",
      "flex-col",
    );
  });

  it("can render as a semantic element other than a div", () => {
    const { container } = render(<Card as="article">Contents</Card>);

    expect(container.firstElementChild?.tagName).toBe("ARTICLE");
  });
});
