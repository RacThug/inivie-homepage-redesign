// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FEATURED_PROPERTY_COUNT } from "@/content/featured-properties";

import { FeaturedProperties } from "./FeaturedProperties";

/**
 * The read itself is a Server Component and is tested in
 * `FeaturedPropertiesContent.test.tsx`. What is left here is the boundary, so
 * the child is replaced by one that suspends and never settles, which is
 * exactly the state the skeleton exists for.
 */
vi.mock("./FeaturedPropertiesContent", () => ({
  FeaturedPropertiesContent: () => {
    throw new Promise<never>(() => {});
  },
}));

describe("FeaturedProperties while the CMS is answering", () => {
  it("paints the heading straight away, without waiting for the API", () => {
    render(<FeaturedProperties />);

    expect(
      screen.getByRole("heading", { name: "Featured property for you" }),
    ).toBeInTheDocument();
  });

  /** DESIGN-SYSTEM ch. 6.6: as many placeholders as there will be cards, in
   *  the track the cards will land in. */
  it("holds the track open with one placeholder per card to come", () => {
    render(<FeaturedProperties />);

    expect(screen.getAllByRole("listitem")).toHaveLength(
      FEATURED_PROPERTY_COUNT,
    );
  });

  it("has no cards yet, so nothing is claimed that the CMS has not said", () => {
    render(<FeaturedProperties />);

    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});
