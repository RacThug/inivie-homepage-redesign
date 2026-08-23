// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JOURNAL } from "@/content/journal";

import { WhatsNew } from "./WhatsNew";

describe("WhatsNew", () => {
  /** Three rather than production's six, so the page does not run too long
   *  (PRD ch. 6.1). */
  it("shows three articles", () => {
    render(<WhatsNew />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  /**
   * One target per article. Production ships a title link and a "Read More"
   * button that go to the same place, which makes a keyboard user tab twice
   * for one destination.
   */
  it("makes the whole card one link", () => {
    render(<WhatsNew />);

    for (const article of JOURNAL.articles) {
      const link = screen.getByRole("link", {
        name: new RegExp(article.title.slice(0, 20)),
      });
      expect(link).toHaveAttribute("href", article.href);
    }
    // Three cards plus the section's own control.
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("titles every card and files it under its section", () => {
    render(<WhatsNew />);

    for (const article of JOURNAL.articles) {
      expect(
        screen.getByRole("heading", { name: article.title }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByText(JOURNAL.articles[0].category)).toHaveLength(3);
  });

  /** These are long editorial titles and cards in a row have to end level. */
  it("clamps the title so a long one cannot lengthen its card", () => {
    render(<WhatsNew />);

    for (const title of screen.getAllByRole("heading", { level: 3 })) {
      expect(title).toHaveClass("line-clamp-3");
    }
  });
});
