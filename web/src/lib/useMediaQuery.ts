"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query as React state.
 *
 * `useSyncExternalStore` rather than an effect that sets state: the server has
 * no viewport to measure, and this is the hook React provides for reading one
 * that it does not own. The server snapshot is `false`, so the first paint is
 * always the narrow layout and the wide one arrives after hydration. That is
 * the right way round for a mobile first stylesheet.
 *
 * Unlike the hero's one shot source choice, this one does subscribe. Answering
 * a rotation here costs a re-render rather than a download.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {};

      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
