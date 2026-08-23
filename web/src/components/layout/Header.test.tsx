// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Header } from "./Header";

function openMenu() {
  return userEvent.click(screen.getByRole("button", { name: "Open menu" }));
}

function desktopNav() {
  return screen.getAllByRole("navigation", { name: "Primary" })[0];
}

describe("Header", () => {
  it("carries production's five entries in order", () => {
    render(<Header />);

    const entries = within(desktopNav())
      .getAllByRole("listitem")
      .filter((item) => item.parentElement === desktopNav().firstElementChild)
      .map((item) => item.textContent);

    expect(entries).toEqual([
      "Resort & Villa",
      "Wonderspace",
      "Svaha Wellness",
      "Souljourn",
      "WeInivie",
    ]);
  });

  it("shows the wordmark rather than the brand set in type", () => {
    render(<Header />);

    const home = screen.getByRole("link", { name: "iNi ViE" });
    expect(home).toHaveAttribute("href", "/");
    // Both tones are in the markup at once, so the crossfade on the first
    // scroll does not wait on a second file.
    expect(home.querySelectorAll("img")).toHaveLength(2);
  });

  it("carries no booking control, because the hero's panel is the one", () => {
    render(<Header />);

    // A second entrance answers the same three questions with none of the
    // visitor's answers. `booking.inivie.com` bare is its own search form.
    expect(
      screen.queryByRole("link", { name: /book/i }),
    ).not.toBeInTheDocument();
  });

  it("starts transparent, because it floats over the hero", () => {
    const { container } = render(<Header />);

    // jsdom has no IntersectionObserver, so the resting state is what renders.
    expect(container.querySelector("header")).toHaveAttribute(
      "data-scrolled",
      "false",
    );
  });

  describe("the brand family panels", () => {
    it("stays shut until asked, and reports that to assistive technology", () => {
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "Resort & Villa",
      });

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(
        within(desktopNav()).queryByRole("link", { name: "SOLO" }),
      ).not.toBeInTheDocument();
    });

    it("opens on hover, which is the behaviour production has", async () => {
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "Resort & Villa",
      });
      await userEvent.hover(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("toggles on tap, because a touch screen has no hover", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "Wonderspace",
      });

      await user.pointer({ keys: "[TouchA]", target: trigger });
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.pointer({ keys: "[TouchA]", target: trigger });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("leaves a hovered panel open when the mouse clicks the trigger", async () => {
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "Wonderspace",
      });

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("sends every destination to the live site in a new tab", async () => {
      render(<Header />);

      await userEvent.click(
        within(desktopNav()).getByRole("button", { name: "Resort & Villa" }),
      );

      const solo = within(desktopNav()).getByRole("link", { name: "SOLO" });
      expect(solo).toHaveAttribute("href", "https://stayatsolo.com");
      expect(solo).toHaveAttribute("target", "_blank");
      expect(solo).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("closes on Escape and hands focus back to the trigger", async () => {
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "Svaha Wellness",
      });
      await userEvent.click(trigger);
      await userEvent.keyboard("{Escape}");

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveFocus();
    });

    it("opens on Down arrow and moves into the panel", async () => {
      render(<Header />);

      const trigger = within(desktopNav()).getByRole("button", {
        name: "WeInivie",
      });
      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(() => document.activeElement?.textContent)
        .toBe("We Inivie");
    });
  });

  it("gives a plain entry no panel and the same new tab treatment", () => {
    render(<Header />);

    const souljourn = within(desktopNav()).getByRole("link", {
      name: "Souljourn",
    });

    expect(souljourn).toHaveAttribute("href", "https://inivie.com/souljourn");
    expect(souljourn).toHaveAttribute("target", "_blank");
  });

  describe("the drawer below 1024px (RS3)", () => {
    it("reports its own state to assistive technology", async () => {
      render(<Header />);

      const toggle = screen.getByRole("button", { name: "Open menu" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveAttribute("aria-controls", "site-menu");

      await openMenu();

      expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    it("opens on the toggle and moves focus into the panel", async () => {
      render(<Header />);
      await openMenu();

      expect(screen.getByRole("dialog", { name: "Site menu" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Close menu" })).toHaveFocus();
    });

    it("closes on Escape and returns focus to the toggle", async () => {
      render(<Header />);
      const toggle = screen.getByRole("button", { name: "Open menu" });

      await openMenu();
      await userEvent.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      // The part usually missed. Without it a keyboard user is dropped at the
      // top of the document every time they dismiss the menu.
      expect(toggle).toHaveFocus();
    });
  });
});
