// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardGrid } from "./CardGrid";

describe("CardGrid", () => {
  it("announces itself as a list of however many cards there are", () => {
    render(
      <CardGrid>
        <li>One</li>
        <li>Two</li>
      </CardGrid>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  /** DESIGN-SYSTEM ch. 7.2. Mobile first, so every rule is a minimum width. */
  it("goes one column, then two, then three", () => {
    render(
      <CardGrid>
        <li>One</li>
      </CardGrid>,
    );

    expect(screen.getByRole("list")).toHaveClass(
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
    );
  });

  it("carries the 20px and 32px card gaps of ch. 4.1", () => {
    render(
      <CardGrid>
        <li>One</li>
      </CardGrid>,
    );

    expect(screen.getByRole("list")).toHaveClass("gap-5", "lg:gap-8");
  });
});
