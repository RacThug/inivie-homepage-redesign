// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRIMARY_NAV } from "@/content/navigation";

import { Header } from "./Header";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

function openMenu() {
  return userEvent.click(screen.getByRole("button", { name: "Open menu" }));
}

describe("Header", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("carries the six intent based navigation items in order", () => {
    render(<Header />);

    const nav = screen.getAllByRole("navigation", { name: "Primary" })[0];
    const labels = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent);

    expect(labels).toEqual([
      "Stay",
      "Dine",
      "Wellness",
      "Offers",
      "Membership",
      "About",
    ]);
  });

  it("leads to the separate booking system rather than implementing it", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Book Now" })).toHaveAttribute(
      "href",
      "https://booking.inivie.com",
    );
  });

  it("starts transparent, because it floats over the hero", () => {
    const { container } = render(<Header />);

    // jsdom has no IntersectionObserver, so the resting state is what renders.
    expect(container.querySelector("header")).toHaveAttribute(
      "data-scrolled",
      "false",
    );
  });

  it("marks the current page with an accent rule, never accent text", () => {
    pathname.current = "/wellness";
    render(<Header />);

    const nav = screen.getAllByRole("navigation", { name: "Primary" })[0];
    const current = within(nav).getByRole("link", { name: "Wellness" });

    expect(current).toHaveAttribute("aria-current", "page");
    // The rule is on a child span; the label itself never takes accent as a
    // colour, because accent reaches only 2.39 to 1 on a light surface.
    expect(current.firstElementChild).toHaveClass("border-accent");
    expect(current).not.toHaveClass("text-accent");
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

    it("offers the same items in the same order as the desktop navigation", async () => {
      render(<Header />);
      await openMenu();

      const panel = screen.getByRole("dialog", { name: "Site menu" });
      const labels = within(panel)
        .getAllByRole("link")
        .map((link) => link.textContent);

      expect(labels).toEqual([
        ...PRIMARY_NAV.map((item) => item.label),
        "Book Now",
      ]);
    });
  });
});
