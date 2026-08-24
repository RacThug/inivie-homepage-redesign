"use client";

import { useEffect, useRef, useState } from "react";

import { focusPageTop, scrollToTop } from "@/lib/pageTop";

/**
 * The back to top control of DESIGN-SYSTEM ch. 6.18.
 *
 * The homepage is 16.6 viewports tall at 375px. The header stays fixed and the
 * search panel docks into it, so the two things a visitor is most likely to
 * want on the way down are already following them; what nothing offered was a
 * way back to the start of the page, and the wordmark that looks like the
 * offer is a link to the route they are already on.
 *
 * It appears after one viewport, which on the homepage is exactly the hero
 * leaving. The rule is written as a viewport rather than as the hero, because
 * this sits in the layout and a page without a hero should still behave.
 *
 * The threshold is a sentinel watched by an `IntersectionObserver`, the same
 * shape `Header` uses for its own two states: one callback per crossing rather
 * than a handler on every scroll frame, and no space taken in the layout.
 */
export function BackToTop() {
  const [past, setPast] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Guarded because jsdom has no IntersectionObserver, and a page that
    // throws on render is worse than one with no back to top button.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/*
        One viewport of nothing at the top of the document, matching the hero's
        own `h-screen min-h-120`. `pointer-events-none` because this covers the
        whole first screen: without it the sentinel would swallow every click
        meant for the hero and the search panel underneath it.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 h-screen min-h-120 w-full"
        ref={sentinelRef}
      />

      {past && (
        <button
          aria-label="Back to top"
          /*
            A `surface` disc on the card's own treatment - 1px border, rest
            elevation, raised on hover - because it has to stay legible over
            whatever it happens to be floating above, including the ink footer
            where it matters most. Full round is what ch. 4.2 reserves for
            icon buttons, and 44px is RS2 on both axes.

            Inset by the container gutter of ch. 4.1, 20px and then 40px. It
            is pinned to the window rather than to the grid, which is what a
            floating control is, so the two only coincide below 1360px; the
            gutter is borrowed because it is the page's own reading of how far
            something sits from an edge, not because the two have to line up.

            `z-30` puts it under the header and under the drawer, and under the
            search panel's mobile sheet, which is pinned to the same corner of
            the window and is the one thing here that would rather have it out
            of the way.
          */
          className="fixed right-5 bottom-5 z-30 inline-flex h-11 w-11 animate-enter items-center justify-center rounded-full border border-border bg-surface text-ink shadow-rest transition-shadow hover:shadow-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:right-10 lg:bottom-10"
          onClick={() => {
            scrollToTop();
            focusPageTop();
          }}
          type="button"
        >
          <ArrowUpIcon />
        </button>
      )}
    </>
  );
}

/** Decorative: the control is named by its `aria-label`. Drawn at the header
 *  hamburger's weight, because they are the same size of icon on the same
 *  page and a second stroke width would be visible. */
function ArrowUpIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M10 16V4M5 9l5-5 5 5" />
    </svg>
  );
}
