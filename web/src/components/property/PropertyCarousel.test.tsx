// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyCarousel } from "./PropertyCarousel";

/**
 * jsdom lays nothing out, so a carousel cannot be scrolled here: every element
 * is zero by zero, and which card is centred is a measurement. What is checked
 * is everything that does not depend on a layout, which is also everything a
 * visitor who never touches the track relies on: that all six cards are in the
 * document rather than waiting to be revealed, that the section is announced
 * once, and that every control says what it does.
 */

const PROPERTIES = [
  "Leedon Villa Seminyak",
  "Ajowa Resort",
  "La Mewali Resort",
  "Astera Canggu",
  "Ini Vie Villa Legian",
  "Aeera Villa Canggu",
];

function slides(titles: string[] = PROPERTIES) {
  return titles.map((title, index) => ({
    id: index + 1,
    label: title,
    card: <h3>{title}</h3>,
  }));
}

function carousel() {
  return screen.getByRole("group", { name: "Featured properties" });
}

describe("PropertyCarousel", () => {
  it("puts every card in the document, in the order it was given them", () => {
    render(<PropertyCarousel slides={slides()} />);

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(PROPERTIES);
  });

  /** A card off the side of the track is clipped, not hidden. A visitor who
   *  reads rather than scrolls still meets all six. */
  it("hides none of them from assistive technology", () => {
    render(<PropertyCarousel slides={slides()} />);

    for (const title of PROPERTIES) {
      expect(screen.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  it("names itself without repeating the word the role description supplies", () => {
    render(<PropertyCarousel slides={slides()} />);

    expect(carousel()).toHaveAttribute("aria-roledescription", "carousel");
    expect(carousel()).toHaveAccessibleName("Featured properties");
  });

  it("offers one dot per property, each named by the property it reaches", () => {
    render(<PropertyCarousel slides={slides()} />);

    for (const title of PROPERTIES) {
      expect(
        screen.getByRole("button", { name: `Go to ${title}` }),
      ).toBeInTheDocument();
    }
  });

  /** The one a visitor is looking at, said rather than only drawn. */
  it("marks the selected property as the current one", () => {
    render(<PropertyCarousel slides={slides()} />);

    expect(
      screen.getByRole("button", { name: "Go to Leedon Villa Seminyak" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("names its steps by what they move, not by which way they point", () => {
    render(<PropertyCarousel slides={slides()} />);

    expect(
      screen.getByRole("button", { name: "Previous property" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next property" }),
    ).toBeInTheDocument();
  });

  /** F3 allows as few as three. The track is shorter, and nothing else about
   *  it changes: still one dot each, still both steps. */
  it("takes a track of three without losing a control", () => {
    render(<PropertyCarousel slides={slides(PROPERTIES.slice(0, 3))} />);

    expect(within(carousel()).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });
});
