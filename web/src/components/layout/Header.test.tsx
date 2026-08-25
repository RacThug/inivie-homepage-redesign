// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Header } from "./Header";
import { visibleText } from "./visibleText";

/**
 * There is no router in a test, and `usePathname` is how the wordmark knows
 * whether the page it points at is the page the visitor is on. `vi.hoisted`
 * because the factory below is lifted above the imports and would otherwise
 * read the binding before it exists.
 */
const route = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

afterEach(() => {
  route.pathname = "/";
  vi.restoreAllMocks();
});

function wordmark() {
  return screen.getByRole("link", { name: "iNi ViE" });
}

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
      .map(visibleText);

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

  describe("the wordmark", () => {
    /**
     * It is a link to `/`, and on the homepage that is the route the visitor
     * is already on, which Next answers by doing nothing at all. Measured at
     * the foot of the built homepage before this: scrollY 12628 before the
     * click, 12628 after. The one control always on screen, and it was inert.
     */
    it("returns a homepage visitor to the top rather than doing nothing", () => {
      const scrollTo = vi
        .spyOn(window, "scrollTo")
        .mockImplementation(() => {});

      render(<Header />);

      expect(fireEvent.click(wordmark())).toBe(false);
      expect(scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 0 });
    });

    /** cmd or ctrl click on a wordmark is how a visitor opens the homepage in
     *  a second tab. Scrolling the page they are reading instead would take
     *  that away and give them something they did not ask for. */
    it("leaves a modified click to the browser", () => {
      const scrollTo = vi
        .spyOn(window, "scrollTo")
        .mockImplementation(() => {});

      render(<Header />);
      const link = wordmark();
      link.addEventListener("click", (event) => event.preventDefault());

      fireEvent.click(link, { metaKey: true });

      expect(scrollTo).not.toHaveBeenCalled();
    });

    /** On any other route it is an ordinary link again, and the navigation is
     *  the whole point of it. */
    it("still navigates from a page that is not the homepage", () => {
      const scrollTo = vi
        .spyOn(window, "scrollTo")
        .mockImplementation(() => {});

      route.pathname = "/about";
      render(<Header />);
      const link = wordmark();
      link.addEventListener("click", (event) => event.preventDefault());

      fireEvent.click(link);

      expect(scrollTo).not.toHaveBeenCalled();
    });
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

  /**
   * The hero is the homepage's, so the transparent treatment is too. On any
   * other route the scrim behind the labels is a grey band over a white page,
   * and the white labels it exists to rescue have nothing else holding them
   * up. The 404 is the route that found this: short enough on a desktop that
   * a scroll never arrives to settle the header.
   */
  it("settles from the first paint on a page with no hero", () => {
    route.pathname = "/about";

    const { container } = render(<Header />);

    expect(container.querySelector("header")).toHaveAttribute(
      "data-scrolled",
      "true",
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
        within(desktopNav()).queryByRole("link", { name: /^SOLO/ }),
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

      const solo = within(desktopNav()).getByRole("link", { name: /^SOLO/ });
      expect(solo).toHaveAttribute("href", "https://stayatsolo.com");
      expect(solo).toHaveAttribute("target", "_blank");
      expect(solo).toHaveAttribute("rel", "noopener noreferrer");

      // And it says so. A new tab takes the back button away, and a visitor
      // who cannot see the tab strip has no other way of being told.
      expect(solo).toHaveAccessibleName(/opens in a new tab/);
      expect(visibleText(solo)).toBe("SOLO");
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
        .poll(() =>
          document.activeElement ? visibleText(document.activeElement) : null,
        )
        .toBe("We Inivie");
    });
  });

  it("gives a plain entry no panel and the same new tab treatment", () => {
    render(<Header />);

    const souljourn = within(desktopNav()).getByRole("link", {
      name: /^Souljourn/,
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
