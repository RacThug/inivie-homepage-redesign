// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HERO_IMAGE, HERO_VIDEO } from "@/content/hero";

/**
 * `HeroMedia` decides which cut to fetch once per page load and caches it in
 * module scope, so every case here needs a module that has not decided yet.
 */
interface Conditions {
  /** What `navigator.connection` reports, where anything reports it. */
  connection?: { saveData?: boolean; effectiveType?: string };
  /** The document's state when the component first renders. */
  readyState?: DocumentReadyState;
}

async function renderWith(
  matching: readonly string[] | null,
  { connection, readyState = "complete" }: Conditions = {},
) {
  vi.resetModules();

  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: connection,
  });

  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => state,
  });

  state = readyState;

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

/** What `document.readyState` currently answers, so a test can move it. */
let state: DocumentReadyState = "complete";

/** The browser reaching the end of the load: `readyState` settles on
 *  "complete" and the event fires, in that order. */
async function finishLoading() {
  state = "complete";

  await act(async () => {
    window.dispatchEvent(new Event("load"));
  });
}

function video(container: HTMLElement) {
  return container.querySelector("video");
}

afterEach(() => {
  Reflect.deleteProperty(window, "matchMedia");
  Reflect.deleteProperty(navigator, "connection");
  Reflect.deleteProperty(document, "readyState");
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

  /**
   * PRD ch. 8.2. The two cuts are 12MB and 16.5MB, and mounted at hydration
   * they opened that request beside the property images and the fonts. The
   * poster is already painted by then and nothing on screen is waiting for
   * the film, so it waits for everything that is.
   */
  it("asks for no film until the page has finished loading", async () => {
    const { container } = await renderWith([], { readyState: "loading" });

    expect(video(container)).toBeNull();

    await finishLoading();

    expect(video(container)).toHaveAttribute("src", HERO_VIDEO.desktop);
  });

  it("mounts it straight away on a visit that has already loaded", async () => {
    // A back forward navigation or a warm cache: `load` fired before React
    // ran, so waiting for it would be waiting for something never coming.
    const { container } = await renderWith([], { readyState: "complete" });

    expect(video(container)).toHaveAttribute("src", HERO_VIDEO.desktop);
  });

  it.each([
    ["a visitor who has asked for less data", { saveData: true }],
    ["a connection that cannot afford it", { effectiveType: "2g" }],
  ])("requests no film for %s", async (_name, connection) => {
    const { container } = await renderWith([], { connection });

    expect(video(container)).toBeNull();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("stays transparent until it can actually play", async () => {
    const { container } = await renderWith([]);

    expect(video(container)).toHaveClass("opacity-0");
  });
});
