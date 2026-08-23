// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MEMBERSHIP } from "@/content/membership";

import { Membership } from "./Membership";

describe("Membership", () => {
  it("carries the tagline, the copy and the four benefits", () => {
    render(<Membership />);

    expect(screen.getByText(MEMBERSHIP.tagline)).toBeInTheDocument();
    expect(screen.getByText(MEMBERSHIP.body)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  /**
   * Production makes this a full bleed orange block. DESIGN-SYSTEM ch. 2.3
   * forbids accent as a large fill, and white on accent measures 2.39 to 1, so
   * the section that needs the most emphasis takes it from `ink`. The brief
   * ch. 4.6 asks that this not be "corrected" back towards production.
   */
  it("takes its emphasis from an ink panel, never an accent fill", () => {
    const { container } = render(<Membership />);

    expect(container.querySelector(".rounded-card")).toHaveClass("bg-ink");
    // Accent reaches exactly one element here, and it is a control.
    expect(Array.from(container.querySelectorAll(".bg-accent"))).toEqual([
      screen.getByRole("link", { name: MEMBERSHIP.primary.label }),
    ]);
  });

  it("sets its heading and eyebrow in the colours that survive ink", () => {
    render(<Membership />);

    expect(screen.getByText(MEMBERSHIP.eyebrow)).toHaveClass("text-gold");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
      "text-surface",
    );
  });

  /** One primary action per section (PRD ch. 6.3), with a quieter second that
   *  leads somewhere else and says so. */
  it("has one accented control and one that names its own destination", () => {
    render(<Membership />);

    const primary = screen.getByRole("link", {
      name: MEMBERSHIP.primary.label,
    });
    const secondary = screen.getByRole("link", {
      name: MEMBERSHIP.secondary.label,
    });

    expect(primary).toHaveClass("bg-accent");
    expect(secondary).not.toHaveClass("bg-accent");
    expect(secondary).toHaveAttribute("href", MEMBERSHIP.secondary.href);
  });

  /** Production sets the heading in all caps, which the brief ch. 7 rules out.
   *  The words are unchanged; only the casing is. */
  it("sets the heading in title case", () => {
    render(<Membership />);
    const heading = screen.getByRole("heading", { level: 2 }).textContent!;

    expect(heading).not.toBe(heading.toUpperCase());
  });
});
