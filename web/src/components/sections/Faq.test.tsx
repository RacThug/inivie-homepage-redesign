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

  /**
   * The rules span the column and the content sits inside them. Flush was the
   * first treatment: the marker then ended level with the end of its own rule
   * and read as clipped rather than placed, and the hover band bled into the
   * section's margin instead of reading as a row.
   */
  describe("the row inset", () => {
    it("holds the question and its marker off the ends of the rule", () => {
      render(<Faq />);

      const summary = screen
        .getByRole("heading", { name: FAQ.entries[0].question })
        .closest("summary");

      expect(summary).toHaveClass("px-2", "sm:px-4");
    });

    /** So an answer starts under the first letter of its question rather than
     *  two pixels to the left of it. */
    it("puts the answer on the same inset as its question", () => {
      render(<Faq />);

      expect(screen.getByText(FAQ.entries[0].answer)).toHaveClass(
        "px-2",
        "sm:px-4",
      );
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
