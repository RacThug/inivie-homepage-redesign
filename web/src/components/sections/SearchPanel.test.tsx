// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DESTINATIONS, SEARCH_ACTION, SEARCH_PANEL } from "@/content/hero";

import { SearchPanel } from "./SearchPanel";

function fields() {
  return {
    destination: screen.getByLabelText(SEARCH_PANEL.destination),
    checkIn: screen.getByLabelText(SEARCH_PANEL.checkIn),
    checkOut: screen.getByLabelText(SEARCH_PANEL.checkOut),
  };
}

describe("SearchPanel", () => {
  /**
   * Booking runs on a separate application, which PRD ch. 3.2 puts out of
   * scope. The panel hands three fields over and stops, so the names it sends
   * are the contract and are worth pinning.
   */
  it("hands the booking system a GET with the fields it expects", () => {
    render(<SearchPanel />);
    const form = screen.getByRole("form", { name: SEARCH_PANEL.label });

    expect(form).toHaveAttribute("action", SEARCH_ACTION);
    expect(form).toHaveAttribute("method", "get");

    const { destination, checkIn, checkOut } = fields();
    expect(destination).toHaveAttribute("name", "city");
    expect(checkIn).toHaveAttribute("name", "checkin");
    expect(checkOut).toHaveAttribute("name", "checkout");
  });

  it("offers every destination production offers", () => {
    render(<SearchPanel />);

    expect(screen.getAllByRole("option")).toHaveLength(DESTINATIONS.length);
    expect(fields().destination).toHaveValue(DESTINATIONS[0].value);
  });

  /**
   * The homepage is prerendered, so a default computed while rendering would
   * be the date the build ran and would still be that date a month later. The
   * date fields are uncontrolled and are filled once, on mount.
   */
  describe("the dates it starts with", () => {
    it("fills tonight and tomorrow rather than leaving the fields empty", () => {
      render(<SearchPanel />);
      const { checkIn, checkOut } = fields();

      expect(checkIn).toHaveValue();
      expect(checkOut).toHaveValue();
      expect(
        (checkOut as HTMLInputElement).value >
          (checkIn as HTMLInputElement).value,
      ).toBe(true);
    });

    it("moves the check out floor when the check in moves past it", async () => {
      const user = userEvent.setup();
      render(<SearchPanel />);
      const { checkIn, checkOut } = fields();

      await user.clear(checkIn);
      await user.type(checkIn, "2027-03-15");

      expect(checkOut).toHaveAttribute("min", "2027-03-16");
      expect(checkOut).toHaveValue("2027-03-16");
    });
  });

  /**
   * Three fields and a button do not fit 375px. Below the tablet breakpoint
   * the panel is one tappable row, and the row is not rendered above it: a
   * hidden control still reporting a collapsed state would describe a panel
   * that is permanently open.
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
      ).toContainElement(fields().destination);
    });

    it("is not on screen from the tablet breakpoint", () => {
      render(<SearchPanel />);

      expect(
        screen.getByRole("button", { name: SEARCH_PANEL.summary }),
      ).toHaveClass("sm:hidden");
    });
  });

  /** Two adults, production's own default, sent rather than asked for: a guest
   *  count picker is booking flow, not homepage. */
  it("sends the guest count without asking for it", () => {
    const { container } = render(<SearchPanel />);

    expect(container.querySelector('input[name="adults"]')).toHaveAttribute(
      "type",
      "hidden",
    );
  });
});
