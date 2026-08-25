// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("the not found page", () => {
  /**
   * A wrong URL used to land on the framework's own black on white default,
   * which reads as a broken application rather than as a page that is not
   * here. The header and the footer come from the root layout; what this
   * file owes is the middle.
   */
  it("says what happened, at the top of the document outline", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: /could not be found/i }),
    ).toBeInTheDocument();
  });

  it("offers the way back", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("link", { name: "Back to the homepage" }),
    ).toHaveAttribute("href", "/");
  });

  /**
   * The layout adds no offset under the fixed header, because the homepage
   * hero is full bleed and runs beneath it. A page without a hero clears the
   * header itself, and without this the heading sat under the header.
   */
  it("clears the fixed header on its own", () => {
    const { container } = render(<NotFound />);

    expect(container.firstElementChild).toHaveClass("pt-40");
  });
});
