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
