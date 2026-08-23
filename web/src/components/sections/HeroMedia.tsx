"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { HERO_IMAGE, HERO_VIDEO } from "@/content/hero";

/**
 * Which cut this visit gets, decided once and then never again.
 *
 * Once, because the alternative is a second multi megabyte download to change
 * a crop. A phone at 390 by 844 turned on its side is 844 wide and crosses
 * production's 768px switch, so a query that stayed live would hand a rotating
 * visitor the whole landscape film for their trouble.
 *
 * `undefined` is "not read yet" and `null` is "read, and there is no film for
 * this visit", which is why the cache cannot just test for a falsy value.
 */
let decidedSource: string | null | undefined;

function heroSource(): string | null {
  if (decidedSource !== undefined) return decidedSource;

  if (typeof window.matchMedia !== "function") {
    decidedSource = null;
  } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    /*
      DESIGN-SYSTEM ch. 5 makes this a hard requirement rather than a
      preference, so the film is not merely paused, it is never requested.
      This is the one place the hero departs from production, which plays its
      loop whatever the operating system has been told.
    */
    decidedSource = null;
  } else {
    decidedSource = window.matchMedia(HERO_VIDEO.mobileQuery).matches
      ? HERO_VIDEO.mobile
      : HERO_VIDEO.desktop;
  }

  return decidedSource;
}

/** Read once at hydration and never republished, so the subscription has
 *  nothing to deliver. */
const noSubscription = () => () => {};

/** The server has no viewport to measure, so it renders the poster alone. */
const noSourceOnServer = () => null;

/**
 * The hero's background: production's poster with production's film over it.
 *
 * The layering is production's own, and it is the right shape regardless. The
 * poster is a real `next/image` with `priority`, so the largest contentful
 * paint is still a 143KB still and is unaffected by anything the film does.
 * The film mounts only after hydration and fades in over the top when it can
 * play. If it never arrives, the page is exactly what it was before.
 *
 * Only one cut is ever fetched. The source is chosen here rather than by
 * `media` on two `<source>` elements, because that markup leaves both files
 * reachable and browsers have long disagreed about which they pull.
 */
export function HeroMedia() {
  const src = useSyncExternalStore(
    noSubscription,
    heroSource,
    noSourceOnServer,
  );
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // `autoPlay` alone loses the race when the element is mounted this late,
    // so the play is also asked for directly. Muted and inline is what every
    // mobile browser requires before it will honour either.
    //
    // The second `?.` is not defensive padding: `play()` returned void before
    // it returned a promise, and jsdom still does.
    videoRef.current?.play()?.catch(() => {
      // Refused. The poster underneath is already the whole picture.
    });
  }, [src]);

  return (
    <>
      <Image
        alt={HERO_IMAGE.alt}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={HERO_IMAGE.src}
      />

      {src && (
        <video
          aria-hidden
          autoPlay
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          loop
          muted
          onCanPlay={() => setVisible(true)}
          playsInline
          preload="auto"
          ref={videoRef}
          src={src}
        />
      )}

      {/*
        Production's overlay, and it has to cover the whole frame rather than
        the lower half this hero used to carry. A still can be chosen to sit
        under a panel; 31 seconds of film cannot, and its last four seconds are
        a white end card. Solid `ink` at the top holds the header's labels, and
        40 per cent from the middle down holds the search panel and whatever
        the film is doing behind it.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink via-ink/40 to-ink/40"
      />
    </>
  );
}
