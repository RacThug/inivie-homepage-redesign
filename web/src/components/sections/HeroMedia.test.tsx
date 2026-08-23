// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HERO_IMAGE, HERO_VIDEO } from "@/content/hero";

/**
 * `HeroMedia` decides which cut to fetch once per page load and caches it in
 * module scope, so every case here needs a module that has not decided yet.
 */
async function renderWith(matching: readonly string[] | null) {
  vi.resetModules();

  if (matching === null) {
    // Some environments have no `matchMedia` at all. The poster has to survive
    // that rather than the hero throwing on render.
    Reflect.deleteProperty(window, "matchMedia");
  } else {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string) => ({ matches: matching.includes(query) }),
    });
  }

  const { HeroMedia } = await import("./HeroMedia");
  return render(<HeroMedia />);
}

function video(container: HTMLElement) {
  return container.querySelector("video");
}

afterEach(() => {
  Reflect.deleteProperty(window, "matchMedia");
});

describe("HeroMedia", () => {
  it("paints the poster whatever happens to the film", async () => {
    await renderWith([]);

    const poster = screen.getByRole("img");
    expect(poster).toHaveAccessibleName(HERO_IMAGE.alt);
    // The largest contentful paint is this still, and PRD ch. 8.2 puts a floor
    // under the score that depends on it.
    expect(poster).not.toHaveAttribute("loading", "lazy");
  });

  it("serves the landscape cut above production's switch", async () => {
    const { container } = await renderWith([]);

    expect(video(container)).toHaveAttribute("src", HERO_VIDEO.desktop);
  });

  it("serves the portrait cut below it, and only that one", async () => {
    const { container } = await renderWith([HERO_VIDEO.mobileQuery]);

    expect(video(container)).toHaveAttribute("src", HERO_VIDEO.mobile);
    expect(container.querySelectorAll("video")).toHaveLength(1);
  });

  it("requests no film at all under reduced motion", async () => {
    const { container } = await renderWith([
      "(prefers-reduced-motion: reduce)",
    ]);

    // DESIGN-SYSTEM ch. 5 calls this a hard requirement, so the file is never
    // asked for rather than fetched and paused. This is the one place the hero
    // departs from production.
    expect(video(container)).toBeNull();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the poster alone where there is no matchMedia to ask", async () => {
    const { container } = await renderWith(null);

    expect(video(container)).toBeNull();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("carries what a browser needs before it will autoplay inline", async () => {
    const { container } = await renderWith([]);
    const film = video(container)!;

    expect(film).toHaveAttribute("autoplay");
    expect(film).toHaveAttribute("playsinline");
    expect(film.muted).toBe(true);
    expect(film).toHaveAttribute("loop");
    // Decorative. The poster beneath it already carries the description.
    expect(film).toHaveAttribute("aria-hidden", "true");
  });

  it("stays transparent until it can actually play", async () => {
    const { container } = await renderWith([]);

    expect(video(container)).toHaveClass("opacity-0");
  });
});
