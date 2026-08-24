// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import {
  DESTINATIONS,
  GUESTS,
  SEARCH_ACTION,
  SEARCH_PANEL,
} from "@/content/hero";

/*
  Imported for its side effect on the module graph, not for anything it
  exports, and it has to name the same module `DateRangeField` lazy-loads:
  that field loads this grid with `lazy`, so the first click on it is also
  the first time Vitest transforms `react-day-picker`.
  Naming it here pays that cost during this file's own import phase, which no
  test timeout covers, rather than inside the wait in "opens a calendar":
  measured at 1.4s on a warm cache with this file running alone, and past ten
  seconds on a fresh clone's first run with eight workers competing for the
  disk. That run is a reviewer's first `npm test`, which is the one that has
  to pass.
*/
import "@/components/ui/Calendar";

import { SearchPanel } from "./SearchPanel";

/** The calendar asks how wide the window is, and jsdom does not volunteer. */
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

function hidden(container: HTMLElement, name: string) {
  return container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
}

function trigger(label: string) {
  return screen.getByRole("button", { name: new RegExp(label, "i") });
}

describe("SearchPanel", () => {
  /**
   * Booking runs on a separate application, which PRD ch. 3.2 puts out of
   * scope. The panel hands its values over and stops, so the names it sends
   * are the contract and are worth pinning. They are hidden inputs because
   * the fields are this project's and the query string is production's.
   */
  it("hands the booking system a GET with the parameters it expects", () => {
    const { container } = render(<SearchPanel />);
    const form = screen.getByRole("form", { name: SEARCH_PANEL.label });

    expect(form).toHaveAttribute("action", SEARCH_ACTION);
    expect(form).toHaveAttribute("method", "get");

    for (const name of ["city", "checkin", "checkout", "adults"]) {
      expect(hidden(container, name)).toHaveAttribute("type", "hidden");
    }
  });

  describe("the destination", () => {
    it("starts on production's first and says so on the trigger", () => {
      const { container } = render(<SearchPanel />);

      expect(hidden(container, "city")).toHaveValue(DESTINATIONS[0].value);
      expect(trigger(DESTINATIONS[0].label)).toBeInTheDocument();
    });

    it("offers every destination production offers, once opened", async () => {
      const user = userEvent.setup();
      render(<SearchPanel />);

      await user.click(trigger(DESTINATIONS[0].label));
      const panel = screen.getByRole("dialog", {
        name: SEARCH_PANEL.destination,
      });

      expect(within(panel).getAllByRole("button")).toHaveLength(
        DESTINATIONS.length,
      );
    });

    it("takes a choice, closes, and sends it", async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchPanel />);

      await user.click(trigger(DESTINATIONS[0].label));
      await user.click(
        screen.getByRole("button", { name: DESTINATIONS[6].label }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(hidden(container, "city")).toHaveValue(DESTINATIONS[6].value);
    });
  });

  describe("the stay", () => {
    /**
     * The homepage is prerendered, so a default computed while rendering would
     * be the date the build ran and would still be that date a month later.
     */
    it("starts on tonight and tomorrow rather than empty", () => {
      const { container } = render(<SearchPanel />);

      const checkIn = hidden(container, "checkin")!.value;
      const checkOut = hidden(container, "checkout")!.value;

      expect(checkIn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(checkOut > checkIn).toBe(true);
    });

    /** NN/G: a month spelled out, because `10/11/2016` is two different days
     *  either side of the Atlantic. */
    it("spells the month rather than writing an ambiguous number", () => {
      render(<SearchPanel />);

      expect(
        screen.getByRole("button", { name: /\d{1,2} [A-Z][a-z]{2}/ }),
      ).toBeInTheDocument();
    });

    it("names the length of the stay, which neither date says alone", () => {
      render(<SearchPanel />);

      expect(screen.getByText("1 night")).toBeInTheDocument();
    });

    it("opens a calendar rather than the browser's own control", async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchPanel />);

      // The control this replaced rendered as a different widget in every
      // engine, and as plain ISO text with no calendar at all in WebKit.
      expect(container.querySelector('input[type="date"]')).toBeNull();

      await user.click(trigger(SEARCH_PANEL.dates));

      expect(
        screen.getByRole("dialog", { name: SEARCH_PANEL.dates }),
      ).toBeInTheDocument();
      /*
        Awaited, because the grid is 32KB of `react-day-picker` that the route
        does not ship until this field is opened (PRD ch. 8.2), so it arrives
        through a Suspense boundary rather than in the click's own render.
        The module itself is already in the graph, imported at the top of this
        file, so what is left here is one boundary resolving. The generous
        timeout stays as insurance on a loaded machine; it is no longer what
        the correctness of this test rests on.
      */
      expect(
        await screen.findByRole("grid", {}, { timeout: 10_000 }),
      ).toBeInTheDocument();
    });
  });

  describe("the guest count", () => {
    it("starts at production's default and reads as a phrase", () => {
      const { container } = render(<SearchPanel />);

      expect(hidden(container, "adults")).toHaveValue(String(GUESTS.default));
      expect(trigger("2 guests")).toBeInTheDocument();
    });

    it("steps within its bounds and sends what it shows", async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchPanel />);

      await user.click(trigger("2 guests"));
      await user.click(screen.getByRole("button", { name: "More guests" }));

      expect(hidden(container, "adults")).toHaveValue("3");
    });

    it("stops at one guest rather than offering a stay for nobody", async () => {
      const user = userEvent.setup();
      render(<SearchPanel />);

      await user.click(trigger("2 guests"));
      const fewer = screen.getByRole("button", { name: "Fewer guests" });

      await user.click(fewer);
      expect(fewer).toBeDisabled();
    });
  });

  /**
   * The fields side by side do not fit 375px. Below the tablet breakpoint the
   * panel is one tappable row, and the row is not rendered above it: a hidden
   * control still reporting a collapsed state would describe a panel that is
   * permanently open.
   */
  describe("the summary row", () => {
    it("starts collapsed and reports it", () => {
      render(<SearchPanel />);

      expect(
        screen.getByRole("button", { name: SEARCH_PANEL.summary }),
      ).toHaveAttribute("aria-expanded", "false");
    });

    it("opens on a keypress and points at the fields it controls", async () => {
      const user = userEvent.setup();
      render(<SearchPanel />);
      const toggle = screen.getByRole("button", { name: SEARCH_PANEL.summary });

      await user.click(toggle);

      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(
        document.getElementById(toggle.getAttribute("aria-controls")!),
      ).toContainElement(trigger(DESTINATIONS[0].label));
    });

    it("is not on screen from the tablet breakpoint", () => {
      render(<SearchPanel />);

      expect(
        screen.getByRole("button", { name: SEARCH_PANEL.summary }),
      ).toHaveClass("sm:hidden");
    });
  });
});

/**
 * The panel does not leave with the hero. `SearchDock` swaps its position on
 * an `IntersectionObserver`; what is checked here is the presentation it
 * takes when it lands, because that is this component's half of the deal.
 */
describe("docked under the header", () => {
  it("keeps its labels for assistive technology while hiding them", () => {
    render(<SearchPanel docked />);

    const dates = screen.getByRole("button", {
      name: new RegExp(SEARCH_PANEL.dates, "i"),
    });

    // Still named, still not drawn: a bar across a page someone is reading
    // has no room for three eyebrows.
    expect(dates).toBeInTheDocument();
    expect(screen.getByText(SEARCH_PANEL.dates)).toHaveClass("sr-only");
  });

  it("opens its menus downward, because upward is off the top of the window", async () => {
    const user = userEvent.setup();
    render(<SearchPanel docked />);

    await user.click(trigger(SEARCH_PANEL.dates));

    expect(
      screen.getByRole("dialog", { name: SEARCH_PANEL.dates }),
    ).toHaveClass("sm:top-full");
  });

  it("opens them upward at rest, where the panel sits on the hero's foot", async () => {
    const user = userEvent.setup();
    render(<SearchPanel />);

    await user.click(trigger(SEARCH_PANEL.dates));

    expect(
      screen.getByRole("dialog", { name: SEARCH_PANEL.dates }),
    ).toHaveClass("sm:bottom-full");
  });

  it("stops being a card and carries no ground of its own", () => {
    render(<SearchPanel docked />);

    // The ground belongs to the band around it, so that band can run edge to
    // edge while these fields stay on the page's container.
    const form = screen.getByRole("form", { name: SEARCH_PANEL.label });
    expect(form).not.toHaveClass("rounded-card");
    expect(form).not.toHaveClass("bg-ink/95");
    expect(form).not.toHaveClass("shadow-raised");
  });

  /**
   * The band is `surface`, so the fields turn over with it. `ink-muted` is
   * measured at 7.61 to 1 there; `border` reaches 1.25 and `muted` 2.16, and
   * a control's boundary needs 3.
   */
  it("turns its fields over to the light tone", () => {
    render(<SearchPanel docked />);

    const dates = trigger(SEARCH_PANEL.dates);
    expect(dates).toHaveClass("border-ink-muted", "text-ink");
    expect(dates).toHaveClass("focus-visible:outline-ink");
  });

  it("keeps the dark tone on the hero, where the ground is ink", () => {
    render(<SearchPanel />);

    const dates = trigger(SEARCH_PANEL.dates);
    expect(dates).toHaveClass("border-surface/25", "text-surface");
    // An ink ring is invisible on ink, for the reason ch. 6.5 gives.
    expect(dates).toHaveClass("focus-visible:outline-surface");
  });

  /**
   * The phone's summary row turns over with them, which it did not.
   *
   * It was written when the panel only ever sat on ink and hard coded
   * `surface` text and a gold pin, so the docked band drew it white on white:
   * the only control the panel has below `sm` was invisible on exactly the
   * breakpoint it exists for, and the bar read as a stray pin in an empty
   * strip. The fields' own tone flip had been applied a field at a time and
   * this row was not a field.
   */
  it("turns the phone's summary row over with them", () => {
    render(<SearchPanel docked />);

    const summary = trigger(SEARCH_PANEL.summary);
    expect(summary).toHaveClass("text-ink");
    expect(summary).toHaveClass("focus-visible:outline-ink");
    expect(summary).not.toHaveClass("text-surface");
  });

  it("keeps that row on the dark tone at rest, where the card is ink", () => {
    render(<SearchPanel />);

    const summary = trigger(SEARCH_PANEL.summary);
    expect(summary).toHaveClass("text-surface");
    expect(summary).toHaveClass("focus-visible:outline-surface");
  });
});
