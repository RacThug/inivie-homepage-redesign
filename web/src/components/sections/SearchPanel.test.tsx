// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { DESTINATIONS, GUESTS, SEARCH_ACTION, SEARCH_PANEL } from "@/content/hero";

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
      await user.click(screen.getByRole("button", { name: DESTINATIONS[6].label }));

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
      expect(screen.getByRole("grid")).toBeInTheDocument();
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
