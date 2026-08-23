import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

/**
 * Testing Library registers its own cleanup only when Vitest globals are on.
 * They are off here, so it is registered explicitly, and only for the tests
 * that actually run in a DOM.
 */
if (typeof document !== "undefined") {
  const { cleanup } = await import("@testing-library/react");

  afterEach(cleanup);
}

/**
 * jsdom implements no media queries at all: `window.matchMedia` is absent
 * rather than answering false, so anything that asks a question of the
 * viewport throws instead of being told no. Two things here ask. The carousel
 * asks whether the visitor has requested reduced motion, and Embla subscribes
 * to every breakpoint in its own options.
 *
 * The stand-in answers no to every query and accepts listeners it will never
 * call, which is the truthful reading of a window that has no viewport and
 * never resizes: no breakpoint applies, and no preference is set. A test that
 * needs a different answer replaces it for itself.
 *
 * It lives here rather than beside the one suite that needs it because the
 * absence belongs to the environment, not to a component, and the next
 * component to ask would otherwise arrive at the same crash.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * The same absence, one layer down. jsdom lays nothing out, so it implements
 * neither observer, and Embla reaches for both: `IntersectionObserver` to know
 * which slides are in view, and `ResizeObserver` to re-measure the track when
 * the viewport changes.
 *
 * Both stand-ins observe and report nothing, which is the honest answer in a
 * document with no geometry: every element is zero by zero and nothing ever
 * resizes. It is also the boundary of what these tests can claim. Where a card
 * sits in the track is measured, so it is not asserted anywhere in this suite;
 * what is asserted is the markup, the labels and the controls, none of which
 * depend on a layout.
 */
if (typeof window !== "undefined") {
  class Idle {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  window.IntersectionObserver ??=
    Idle as unknown as typeof IntersectionObserver;
  window.ResizeObserver ??= Idle as unknown as typeof ResizeObserver;
}
