// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Venue } from "@/content/venues";

import { VenueCard } from "./VenueCard";

const VENUE: Venue = {
  name: "Norii Seminyak",
  category: "Japanese",
  location: "Seminyak, Bali",
  image: "/home/culinary/norii-seminyak.webp",
  imageAlt: "A sharing platter of nigiri and sashimi at Norii Seminyak.",
};

describe("VenueCard", () => {
  it("communicates the name, the category and the place", () => {
    render(<VenueCard venue={VENUE} />);

    expect(
      screen.getByRole("heading", { name: "Norii Seminyak" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();
    expect(screen.getByText("Seminyak, Bali")).toBeInTheDocument();
  });

  /** PRD ch. 8.4: meaningful alternative text on every image. It describes the
   *  photograph, not the venue, whose name is already beside it. */
  it("carries alternative text that is not the venue name again", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(VENUE.imageAlt);
  });

  /**
   * The brief ch. 4.4 asks for something lighter than the property card, and
   * the weight comes off the chrome rather than the information. There is
   * nothing to press on a venue, so there is no control that looks pressable
   * and no hover motion suggesting one.
   */
  it("offers nothing to press", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the 4:3 image ratio and the card radius of ch. 6.1", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.getByRole("img").parentElement).toHaveClass(
      "aspect-4/3",
      "rounded-card",
    );
  });
});
