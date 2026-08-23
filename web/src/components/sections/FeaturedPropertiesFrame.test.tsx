// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeaturedPropertiesFrame } from "./FeaturedPropertiesFrame";

describe("FeaturedPropertiesFrame", () => {
  it("carries the section copy PRD ch. 6.2 specifies", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByText("Stay With Us")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Featured property for you" }),
    ).toBeInTheDocument();
  });

  /** A landmark named from the heading it already shows, rather than from a
   *  second copy of the words in an aria-label. */
  it("names the region from its own heading", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(
      screen.getByRole("region", { name: "Featured property for you" }),
    ).toBeInTheDocument();
  });

  /** PRD ch. 6.2: a filled ink pill, deliberately quieter than the accent
   *  fill a card's own call to action carries. */
  it("renders View All Family as an ink pill rather than a text link", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByRole("link", { name: "View All Family" })).toHaveClass(
      "bg-ink",
      "text-surface",
    );
  });

  it("puts whatever it is given below the header", () => {
    render(<FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>);

    expect(screen.getByText("Grid")).toBeInTheDocument();
  });

  /**
   * Where that pill sits, and the fact that there is only one of it in the
   * document, is `SectionLayout`'s behaviour and is tested there. What is
   * asserted here is only what this section decides.
   */
  it("sits in the page's shared vertical rhythm", () => {
    const { container } = render(
      <FeaturedPropertiesFrame>Grid</FeaturedPropertiesFrame>,
    );

    expect(container.firstElementChild).toHaveClass("py-16", "lg:py-24");
  });
});
