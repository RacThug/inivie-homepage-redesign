// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Venue } from "@/content/venues";

import { VenueCard } from "./VenueCard";

const VENUE: Venue = {
  name: "Norii Seminyak",
  url: "https://thewonderspace.com/noriiseminyak",
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
   * the weight still comes off the chrome rather than the information: no
   * border, no elevation, and no button competing with the section's own
   * control. What the card does have is one destination, and the whole card is
   * it, so six venues are announced as six links rather than as twelve.
   */
  it("is one link to the venue's own page, and carries no second control", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute("href", VENUE.url);
    expect(screen.queryByRole("button")).toBeNull();
  });

  /**
   * DESIGN-SYSTEM ch. 6.4's rule for every outbound link on this page: the
   * project redesigns one page, so a visitor sent off it keeps the page they
   * were reading. `rel` is asserted alongside `target` because a new tab
   * without it hands the opened page a handle on this one.
   */
  it("opens the venue in a new tab, and says so to a screen reader", () => {
    render(<VenueCard venue={VENUE} />);

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAccessibleName(/opens in a new tab/);
  });

  /** DESIGN-SYSTEM ch. 6.10. The motion is the card saying it leads
   *  somewhere, which is why it arrived with the destination and not
   *  before it. */
  it("scales its image when the card is hovered", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.getByRole("img")).toHaveClass("group-hover:scale-104");
  });

  it("keeps the 4:3 image ratio and the card radius of ch. 6.1", () => {
    render(<VenueCard venue={VENUE} />);

    expect(screen.getByRole("img").parentElement).toHaveClass(
      "aspect-4/3",
      "rounded-card",
    );
  });
});
