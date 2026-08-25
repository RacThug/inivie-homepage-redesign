"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { NewTabHint } from "@/components/ui/NewTabHint";
import { Container } from "@/components/ui/Container";
import {
  BRAND_LOGO,
  BRAND_NAME,
  isNavGroup,
  PRIMARY_NAV,
} from "@/content/navigation";
import { HOME_LINK_ID, scrollToTop } from "@/lib/pageTop";

const DRAWER_ID = "site-menu";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

/**
 * The site header. Sticky, transparent over the hero, solid once scrolled.
 *
 * The two states are read from a sentinel rather than from a scroll listener.
 * The sentinel is one header's height of absolutely positioned nothing at the
 * top of the document, and an IntersectionObserver reports when it leaves the
 * viewport. That costs one callback per crossing instead of a handler on every
 * scroll frame, and it takes no space in the layout.
 *
 * Transparent is the resting state on the homepage alone. The homepage hero is
 * the only thing this header is meant to float over, and it is full bleed by
 * design (PRD ch. 6.1), which is why `main` carries no top offset here. Every
 * other route starts solid, per `overHero` below.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Guarded because jsdom has no IntersectionObserver, and a header that
    // throws on render is worse than one that stays in its resting state.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  /**
   * The transparent treatment belongs to the hero, and the hero belongs to
   * the homepage (PRD ch. 6.1). Every other route has nothing behind the
   * header, where the scrim below renders as a grey band across the top of a
   * white page and the white labels depend on that band to be legible at all.
   * Those routes take the settled treatment from the first paint rather than
   * waiting for a scroll that may never come: the 404 does not scroll at all
   * on a desktop, so the header would have stayed in its hero state for the
   * whole visit.
   *
   * The 404 is the only other route this application answers, and it reports
   * itself here as `/_not-found` rather than as the URL the visitor typed.
   * Measured against a production build rather than assumed, because the same
   * value decides whether the wordmark navigates or scrolls below.
   */
  const overHero = pathname === "/";
  const solid = scrolled || !overHero;

  const labelColour = solid ? "text-ink" : "text-surface";

  /**
   * The wordmark is a link to `/`, and on the homepage that is the route the
   * visitor is already on. Next answers a navigation to the current route by
   * doing nothing, which left the one control that is always on screen and
   * reads as "take me back to the start" doing nothing at all: measured at the
   * foot of the homepage, scrollY was 12628 before the click and 12628 after.
   *
   * So on that page it scrolls instead of navigating, which is what it looked
   * like it would do. Everywhere else it stays an ordinary link.
   *
   * A modified click is left alone: cmd or ctrl click on a wordmark is how a
   * visitor opens the homepage in a second tab, and preventing the default
   * there would take that away to run a scroll they did not ask for.
   */
  function returnToTop(event: MouseEvent<HTMLAnchorElement>): void {
    if (pathname !== "/") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    event.preventDefault();
    scrollToTop();
  }

  return (
    <>
      <div
        aria-hidden
        className="absolute top-0 h-16 w-full lg:h-20"
        ref={sentinelRef}
      />

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          solid ? "border-b border-border bg-surface" : ""
        }`}
        data-scrolled={solid ? "true" : "false"}
      >
        {/*
          A thin top down scrim rather than a full overlay, so white labels stay
          legible over an arbitrary photograph without flattening it. Ink at 55
          per cent fading to nothing over 220px, which is deeper than the header
          so the gradient ends below it rather than at its edge.
        */}
        {!solid && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-55 bg-gradient-to-b from-ink/55 to-transparent"
          />
        )}

        <Container>
          <div className="relative flex h-16 items-center justify-between lg:h-20">
            {/*
              `next/link` for the homepage, which is the one route this project
              builds and so the one that gets client side navigation. Every
              destination in the navigation below is on the live site and opens
              in a new tab, which is why those are plain anchors: this is a
              homepage redesign, and leaving it in place is the point.

              Both tones of the wordmark are in the markup at once and crossfade
              with the header, rather than one `src` swapping on scroll. A swap
              would flash on the first crossing while the second file loads, and
              it would fight the colour transition already running beside it.
            */}
            <Link
              aria-label={BRAND_NAME}
              className={`relative block h-12 w-12 shrink-0 lg:h-16 lg:w-16 ${FOCUS_RING} ${labelColour}`}
              href="/"
              id={HOME_LINK_ID}
              onClick={returnToTop}
            >
              <LogoTone alt="" eager hidden={solid} src={BRAND_LOGO.light} />
              <LogoTone alt="" hidden={!solid} src={BRAND_LOGO.ink} />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {PRIMARY_NAV.map((entry) => (
                  <li key={entry.label}>
                    {isNavGroup(entry) ? (
                      <NavDropdown group={entry} labelColour={labelColour} />
                    ) : (
                      <a
                        className={`group inline-flex min-h-11 items-center text-small font-medium transition-colors ${labelColour} ${FOCUS_RING}`}
                        href={entry.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {/*
                          The hover marker is an accent rule under a label that
                          keeps its own colour. Accent reaches 2.39 to 1 on a
                          light surface, so it marks and never carries text
                          (DESIGN-SYSTEM ch. 2.3).
                        */}
                        <span className="border-b-2 border-transparent pb-1 transition-colors group-hover:border-accent">
                          {entry.label}
                        </span>
                        <NewTabHint />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <button
              aria-controls={DRAWER_ID}
              aria-expanded={drawerOpen}
              aria-label="Open menu"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-control transition-colors lg:hidden ${labelColour} ${FOCUS_RING}`}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <MenuIcon />
            </button>
          </div>
        </Container>
      </header>

      <MobileDrawer
        id={DRAWER_ID}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      />
    </>
  );
}

/**
 * One tone of the wordmark. Both are always present and the header fades
 * between them, so `hidden` here means transparent and inert rather than
 * removed: taking one out of the DOM is what would cost a load on the first
 * scroll.
 *
 * The resting tone loads eagerly: it is the brand mark at the top of the
 * document and there is nothing to defer it past. `loading` rather than the
 * `priority` this used to carry, which Next 16 deprecated in favour of an
 * explicit `preload` (`node_modules/next/dist/docs`, Image, ch. preload).
 *
 * Next emits a preload link for an eager image either way, verified in the
 * built HTML: the second tone below is the one with `loading="lazy"` and it
 * is the one with no link. So this is a rename to the supported prop rather
 * than a change in what the browser is asked to do.
 */
function LogoTone({
  alt,
  eager = false,
  hidden,
  src,
}: {
  alt: string;
  eager?: boolean;
  hidden: boolean;
  src: string;
}) {
  return (
    <Image
      alt={alt}
      className={`absolute inset-0 object-contain transition-opacity ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      fill
      loading={eager ? "eager" : "lazy"}
      sizes="64px"
      src={src}
    />
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}
