// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Villa</Badge>);

    expect(screen.getByText("Villa")).toBeInTheDocument();
  });

  it("uses ink on a near opaque surface, so it stays legible over a photograph", () => {
    const { container } = render(<Badge>Villa</Badge>);

    expect(container.firstElementChild).toHaveClass(
      "bg-surface/95",
      "text-ink",
    );
  });

  it("takes the control radius from DESIGN-SYSTEM ch. 4.2", () => {
    const { container } = render(<Badge>Villa</Badge>);

    expect(container.firstElementChild).toHaveClass("rounded-control");
  });
});
