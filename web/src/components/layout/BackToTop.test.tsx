// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_LINK_ID } from "@/lib/pageTop";

import { BackToTop } from "./BackToTop";

const CONTROL = { name: "Back to top" };

/**
 * The setup file's stand-in observer accepts a callback and never calls it,
 * which is the right default for a document with no geometry and is why every
 * other suite sees components in their resting state. This one is about the
 * crossing itself, so it keeps the callback and fires it by hand.
 */
let report: ((entries: { isIntersecting: boolean }[]) => void) | null = null;

class Watched {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    report = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

/** The whole page, as far as this control is concerned: the wordmark it hands
 *  focus back to, and itself. */
function renderPage() {
  return render(
    <>
      <a href="#top" id={HOME_LINK_ID}>
        iNi ViE
      </a>
      <BackToTop />
    </>,
  );
}

/** One viewport gone, which is the sentinel leaving the window. */
function scrollPast() {
  act(() => report?.([{ isIntersecting: false }]));
}

function reduceMotion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({ matches: reduced, media: query }) as unknown as MediaQueryList,
  );
}

beforeEach(() => {
  window.IntersectionObserver =
    Watched as unknown as typeof IntersectionObserver;
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  report = null;
  vi.restoreAllMocks();
});

describe("BackToTop", () => {
  it("is not there while the visitor is still in the first viewport", () => {
    renderPage();

    expect(screen.queryByRole("button", CONTROL)).not.toBeInTheDocument();
  });

  it("arrives once a viewport has gone by", () => {
    renderPage();
    scrollPast();

    expect(screen.getByRole("button", CONTROL)).toBeVisible();
  });

  /**
   * The sentinel covers the whole first screen of the document, which is the
   * hero, the search panel, and every control in it. Without this it would
   * take the clicks meant for all three, and the page would look fine and
   * answer nothing.
   */
  it("watches the first viewport without taking its clicks", () => {
    const { container } = renderPage();
    const sentinel = container.querySelector("[aria-hidden]");

    expect(sentinel).toHaveClass("pointer-events-none");
  });

  it("sends the window home", async () => {
    renderPage();
    scrollPast();

    await userEvent.click(screen.getByRole("button", CONTROL));

    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 0,
    });
  });

  /**
   * DESIGN-SYSTEM ch. 5 calls this a hard requirement rather than a nicety.
   * The stylesheet already collapses every CSS transition under the query; a
   * scroll the browser runs is the piece it cannot reach.
   */
  it("jumps rather than glides where motion has been asked to stop", async () => {
    reduceMotion(true);
    renderPage();
    scrollPast();

    await userEvent.click(screen.getByRole("button", CONTROL));

    expect(window.scrollTo).toHaveBeenCalledWith({ behavior: "auto", top: 0 });
  });

  /** Some environments have no `matchMedia` to ask. Nothing has been asked
   *  not to move there, so the default stands rather than the control failing. */
  it("still scrolls where there is no preference to read", async () => {
    Reflect.deleteProperty(window, "matchMedia");
    renderPage();
    scrollPast();

    await userEvent.click(screen.getByRole("button", CONTROL));

    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 0,
    });
  });

  /**
   * The control removes itself as soon as the scroll it started arrives, and
   * an element that disappears while focused drops focus onto `body`. A
   * keyboard visitor would land back at the top of the page and find their
   * next Tab starting from the beginning of the document, which is the
   * journey they pressed the button to avoid.
   */
  it("hands focus to the wordmark before it goes", async () => {
    renderPage();
    scrollPast();

    await userEvent.click(screen.getByRole("button", CONTROL));

    expect(screen.getByRole("link", { name: "iNi ViE" })).toHaveFocus();
  });
});
