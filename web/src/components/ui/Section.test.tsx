// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Section } from "./Section";

describe("Section", () => {
  function section(markup: React.ReactElement) {
    return render(markup).container.firstElementChild!;
  }

  it("renders its children inside the page container", () => {
    render(
      <Section>
        <p>Contents</p>
      </Section>,
    );

    expect(screen.getByText("Contents").parentElement).toHaveClass(
      "max-w-page",
    );
  });

  /** DESIGN-SYSTEM ch. 4.1. The one number the whole page shares, which is
   *  why it is asserted here rather than in eleven section tests. */
  it("carries the 64px and 96px section padding", () => {
    expect(section(<Section>Contents</Section>)).toHaveClass(
      "py-16",
      "lg:py-24",
    );
  });

  it("sits on the plain surface by default", () => {
    expect(section(<Section>Contents</Section>)).not.toHaveClass(
      "bg-surface-alt",
    );
  });

  it("takes the alternating ground when the page asks for it", () => {
    expect(section(<Section tone="alt">Contents</Section>)).toHaveClass(
      "bg-surface-alt",
    );
  });

  /** A landmark named from a heading a reader can already see, rather than
   *  from a second copy of the words in an `aria-label`. */
  it("names the region from the heading it is given", () => {
    render(
      <Section labelledBy="offers">
        <h2 id="offers">Our Special Offers</h2>
      </Section>,
    );

    expect(
      screen.getByRole("region", { name: "Our Special Offers" }),
    ).toBeInTheDocument();
  });
});
