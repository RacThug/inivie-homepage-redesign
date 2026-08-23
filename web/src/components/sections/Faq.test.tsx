// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FAQ } from "@/content/faq";

import { Faq } from "./Faq";

describe("Faq", () => {
  it("carries every question production publishes", () => {
    render(<Faq />);

    for (const entry of FAQ.entries) {
      expect(
        screen.getByRole("heading", { name: entry.question }),
      ).toBeInTheDocument();
    }
  });

  /**
   * Issue #15 asks for an accordion that is keyboard operable without custom
   * JavaScript. `details` and `summary` are that: the browser supplies the
   * role, the expanded state, Enter and Space, and it all works before
   * hydration and with script switched off.
   */
  describe("as a native disclosure", () => {
    it("starts closed", () => {
      const { container } = render(<Faq />);

      expect(container.querySelectorAll("details[open]")).toHaveLength(0);
    });

    it("opens the row a keyboard lands on", async () => {
      const user = userEvent.setup();
      const { container } = render(<Faq />);
      const first = container.querySelector("details")!;

      await user.click(screen.getByText(FAQ.entries[0].question));

      expect(first.open).toBe(true);
      expect(screen.getByText(FAQ.entries[0].answer)).toBeVisible();
    });

    /** Closing somebody's answer because they opened a second one is a
     *  behaviour nobody asked for, and it is the only thing here that would
     *  need script. */
    it("leaves an open row open when a second is opened", async () => {
      const user = userEvent.setup();
      const { container } = render(<Faq />);
      const [first, second] = Array.from(container.querySelectorAll("details"));

      await user.click(screen.getByText(FAQ.entries[0].question));
      await user.click(screen.getByText(FAQ.entries[1].question));

      expect(first.open).toBe(true);
      expect(second.open).toBe(true);
    });

    /** `details` announces its own state, so a hand written `aria-expanded`
     *  would be a second source of truth for the same fact. */
    it("writes no expanded state of its own", () => {
      const { container } = render(<Faq />);

      expect(container.querySelector("[aria-expanded]")).toBeNull();
    });
  });

  /** Brief ch. 4.11: a centred column of roughly 900px. This and the welcome
   *  block are the two places on the page where centring is correct. */
  it("centres the heading over a capped column", () => {
    render(<Faq />);

    const heading = screen.getByRole("heading", { name: FAQ.heading });

    expect(heading.parentElement).toHaveClass("text-center");
    expect(heading.parentElement?.parentElement).toHaveClass(
      "mx-auto",
      "max-w-4xl",
    );
  });
});
