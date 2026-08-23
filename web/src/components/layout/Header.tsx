"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  BOOKING_CTA,
  BRAND_LOGO,
  BRAND_NAME,
  isNavGroup,
  PRIMARY_NAV,
} from "@/content/navigation";

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
 * Transparent is the resting state and solid is the scrolled one, so a page
 * with no hero behind the header still starts transparent. The homepage hero
 * is the only thing this header is meant to float over, and it is full bleed
 * by design (PRD ch. 6.1), which is why `main` carries no top offset here.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const labelColour = scrolled ? "text-ink" : "text-surface";

  return (
    <>
      <div
        aria-hidden
        className="absolute top-0 h-16 w-full lg:h-20"
        ref={sentinelRef}
      />

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors ${
          scrolled ? "border-b border-border bg-surface" : ""
        }`}
        data-scrolled={scrolled ? "true" : "false"}
      >
        {/*
          A thin top down scrim rather than a full overlay, so white labels stay
          legible over an arbitrary photograph without flattening it. Ink at 55
          per cent fading to nothing over 220px, which is deeper than the header
          so the gradient ends below it rather than at its edge.
        */}
        {!scrolled && (
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
            >
              <LogoTone
                alt=""
                hidden={scrolled}
                priority
                src={BRAND_LOGO.light}
              />
              <LogoTone alt="" hidden={!scrolled} src={BRAND_LOGO.ink} />
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
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden lg:block">
              <Button href={BOOKING_CTA.href}>{BOOKING_CTA.label}</Button>
            </div>

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
 */
function LogoTone({
  alt,
  hidden,
  priority = false,
  src,
}: {
  alt: string;
  hidden: boolean;
  priority?: boolean;
  src: string;
}) {
  return (
    <Image
      alt={alt}
      className={`absolute inset-0 object-contain transition-opacity ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
      fill
      priority={priority}
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
