// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HERO_IMAGE, SEARCH_PANEL, WELCOME } from "@/content/hero";

import { Hero } from "./Hero";
import { WelcomeBlock } from "./WelcomeBlock";

describe("Hero", () => {
  /**
   * PRD ch. 6.1: one large image carrying the search panel and nothing else.
   * No headline sits on the photograph, which is what keeps the largest
   * contentful paint a single image with nothing composited over it.
   */
  it("puts no heading on the photograph", () => {
    render(<Hero />);

    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("carries the poster, described, and eager", () => {
    render(<Hero />);
    const image = screen.getByRole("img");

    expect(image).toHaveAccessibleName(HERO_IMAGE.alt);
    expect(image).not.toHaveAttribute("loading", "lazy");
  });

  /**
   * axe's `landmark-unique`. A named `<section>` is a region, and this one was
   * labelled "iNi ViE Hospitality" while the welcome block below it is
   * labelled by an `<h1>` reading the same words. Two regions with one name
   * are two landmarks a screen reader user cannot tell apart, and the hero
   * had nothing of its own to announce: the photograph carries its own
   * description and the panel inside it is already a `form` landmark.
   */
  it("adds no landmark of its own, so the brand name stays the welcome block's", () => {
    render(<Hero />);

    expect(screen.queryByRole("region")).toBeNull();
  });

  it("carries the search panel", () => {
    render(<Hero />);

    expect(
      screen.getByRole("form", { name: SEARCH_PANEL.label }),
    ).toBeInTheDocument();
  });

  /** DESIGN-SYSTEM ch. 6.8: full viewport, as production has it, over a 480px
   *  floor for a short landscape window. */
  it("fills the viewport, with a floor under it", () => {
    const { container } = render(<Hero />);

    expect(container.querySelector("section")).toHaveClass(
      "h-screen",
      "min-h-120",
    );
  });
});

describe("WelcomeBlock", () => {
  /** The page's one h1, and it is here rather than on the hero: a 350
   *  character paragraph is unreadable over a photograph but fine on a plain
   *  ground, and the measure cap can only hold here. */
  it("carries the page's only top level heading", () => {
    render(<WelcomeBlock />);

    expect(
      screen.getByRole("heading", { level: 1, name: WELCOME.heading }),
    ).toBeInTheDocument();
  });

  it("caps the company paragraph at the measure", () => {
    render(<WelcomeBlock />);

    expect(screen.getByText(WELCOME.body)).toHaveClass("max-w-measure");
  });

  /** One primary action per section, and it names its destination. */
  it("offers one control, which says where it goes", () => {
    render(<WelcomeBlock />);

    expect(
      screen.getByRole("link", { name: WELCOME.action.label }),
    ).toHaveAttribute("href", WELCOME.action.href);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
