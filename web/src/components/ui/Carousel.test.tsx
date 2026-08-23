// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CarouselLabels } from "@/content/carousel";

import { Carousel } from "./Carousel";

/**
 * jsdom lays nothing out, so a carousel cannot be scrolled here: every element
 * is zero by zero, and which card is centred is a measurement. What is checked
 * is everything that does not depend on a layout, which is also everything a
 * visitor who never touches the track relies on: that every card is in the
 * document rather than waiting to be revealed, that the track is announced
 * once, and that each control says what it does.
 */

const LABELS: CarouselLabels = {
  label: "Featured properties",
  previous: "Previous property",
  next: "Next property",
  goTo: "Go to {name}",
};

const NAMES = [
  "Leedon Villa Seminyak",
  "Ajowa Resort",
  "La Mewali Resort",
  "Astera Canggu",
  "Ini Vie Villa Legian",
  "Aeera Villa Canggu",
];

function slides(names: string[] = NAMES) {
  return names.map((name) => ({
    id: name,
    label: name,
    card: <h3>{name}</h3>,
  }));
}

function carousel() {
  return screen.getByRole("group", { name: LABELS.label });
}

describe("Carousel", () => {
  it("puts every card in the document, in the order it was given them", () => {
    render(<Carousel labels={LABELS} slides={slides()} />);

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(NAMES);
  });

  /** A card off the side of the track is clipped, not hidden. A visitor who
   *  reads rather than scrolls still meets all six. */
  it("hides none of them from assistive technology", () => {
    render(<Carousel labels={LABELS} slides={slides()} />);

    for (const name of NAMES) {
      expect(screen.getByRole("heading", { name })).toBeVisible();
    }
  });

  it("names itself without repeating the word the role description supplies", () => {
    render(<Carousel labels={LABELS} slides={slides()} />);

    expect(carousel()).toHaveAttribute("aria-roledescription", "carousel");
    expect(carousel()).toHaveAccessibleName("Featured properties");
  });

  it("offers one dot per card, each named by the card it reaches", () => {
    render(<Carousel labels={LABELS} slides={slides()} />);

    for (const name of NAMES) {
      expect(
        screen.getByRole("button", { name: `Go to ${name}` }),
      ).toBeInTheDocument();
    }
  });

  /** The one a visitor is looking at, said rather than only drawn. */
  it("marks the selected card as the current one", () => {
    render(<Carousel labels={LABELS} slides={slides()} />);

    expect(
      screen.getByRole("button", { name: "Go to Leedon Villa Seminyak" }),
    ).toHaveAttribute("aria-current", "true");
  });

  /** Three carousels on one page, so a control that said "Next" would be
   *  three controls a screen reader cannot tell apart. */
  it("takes the words of the section it is placed in", () => {
    const spas: CarouselLabels = {
      label: "Spas",
      previous: "Previous spa",
      next: "Next spa",
      goTo: "Go to {name}",
    };

    render(<Carousel labels={spas} slides={slides(["Svaha Spa Ajowa"])} />);

    expect(
      screen.getByRole("button", { name: "Next spa" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next property" }),
    ).not.toBeInTheDocument();
  });

  /** F3 allows as few as three properties. The track is shorter, and nothing
   *  else about it changes: still one dot each, still both steps. */
  it("takes a track of three without losing a control", () => {
    render(<Carousel labels={LABELS} slides={slides(NAMES.slice(0, 3))} />);

    expect(within(carousel()).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });
});
