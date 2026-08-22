// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "./Container";

describe("Container", () => {
  it("renders its children", () => {
    render(<Container>Contents</Container>);

    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("centres content at the 1280px page width from DESIGN-SYSTEM ch. 4.1", () => {
    const { container } = render(<Container>Contents</Container>);

    expect(container.firstElementChild).toHaveClass("mx-auto", "max-w-page");
  });

  it("carries the side padding for both breakpoints", () => {
    const { container } = render(<Container>Contents</Container>);

    // 20px on mobile, 40px on desktop, on the 4px spacing scale.
    expect(container.firstElementChild).toHaveClass("px-5", "lg:px-10");
  });
});
