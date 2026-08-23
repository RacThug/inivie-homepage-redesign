"use client";

import { useEffect, useRef, useState } from "react";

import { SearchPanel } from "@/components/sections/SearchPanel";
import { Container } from "@/components/ui/Container";

/**
 * The search panel, and the fact that it does not leave with the hero.
 *
 * Below the fold there was no way to book at all. That gap was opened
 * deliberately when the header's empty "Book Now" was removed, on the grounds
 * that a second entrance to one booking system is worse than none; this is the
 * other half of that decision. The panel a visitor already filled in is the
 * thing that follows them down the page, rather than a button that would
 * throw those answers away.
 *
 * One `SearchPanel`, moved rather than duplicated. Two would be two sets of
 * fields to keep in step, and a visitor who chose their dates on the hero
 * would find them missing from the bar that replaced it. Because it is the
 * same element in the same place in the tree, its state and its focus survive
 * the change of position.
 */
export function SearchDock() {
  const [docked, setDocked] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Guarded because jsdom has no IntersectionObserver, and a hero that
    // throws on render is worse than a panel that never docks.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setDocked(!entry.isIntersecting),
      {
        /*
          The header's own height, so the handoff happens as the panel passes
          under it rather than as it passes the top of the window. One number
          for both breakpoints: the header is 64px on a phone and 80px above
          it, and docking 16px late on a phone is not something anybody can
          see mid scroll.
        */
        rootMargin: "-80px 0px 0px 0px",
      },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/*
        A line where the resting panel's top edge sits, which is what has to
        cross the header for the handoff to be seamless. Watching the hero's
        own bottom edge instead would leave the panel gone for the 160px of
        scroll between the two.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-28 h-px lg:bottom-40"
        ref={sentinelRef}
      />

      {/*
        No entrance animation on the docked wrapper, deliberately. ch. 5's
        `animate-enter` is a fade and a 12px rise, and it fills both ways, so
        the element keeps a `transform` after it finishes. A transformed
        element is a containing block for `position: fixed` descendants, which
        turned the phone's calendar sheet from something pinned to the bottom
        of the window into something pinned to the bottom of this bar, up
        under the header. The scroll is the motion here.
      */}
      <div
        className={
          docked
            ? "fixed inset-x-0 top-[4.75rem] z-30 lg:top-[5.75rem]"
            : "absolute inset-x-0 bottom-0 pb-6 sm:pb-8 lg:pb-12"
        }
      >
        <Container>
          <SearchPanel docked={docked} />
        </Container>
      </div>
    </>
  );
}
