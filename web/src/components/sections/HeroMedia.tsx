"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { HERO_IMAGE, HERO_VIDEO } from "@/content/hero";

/**
 * The part of the Network Information API this file asks about.
 *
 * Declared here rather than imported, because it is not in the DOM lib: the
 * specification is a working draft and only Chromium ships it. Everything
 * below treats an absent `connection` as an unremarkable one.
 */
interface DataSaverNavigator extends Navigator {
  connection?: { saveData?: boolean; effectiveType?: string };
}

/** Connections on which a multi megabyte decoration is not worth its cost. */
const SLOW = new Set(["slow-2g", "2g", "3g"]);

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

  const { connection } = navigator as DataSaverNavigator;

  if (typeof window.matchMedia !== "function") {
    decidedSource = null;
  } else if (
    connection?.saveData ||
    SLOW.has(connection?.effectiveType ?? "")
  ) {
    /*
      The two cuts are 12MB and 16.5MB of production's own film. That is a
      decoration behind a poster that already carries the picture, so a
      visitor who has asked their browser to spend less data, or is on a
      connection that cannot afford it, is not charged for it. Same handling
      as reduced motion below: not fetched, rather than fetched and hidden.
    */
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
 * poster is a real `next/image`, preloaded from the head, so what a visitor
 * sees first is a 143KB still and is unaffected by anything the film does.
 * The film mounts only once the page has loaded and fades in over the top
 * when it can play. If it never arrives, the page is what it was before.
 *
 * Only one cut is ever fetched. The source is chosen here rather than by
 * `media` on two `<source>` elements, because that markup leaves both files
 * reachable and browsers have long disagreed about which they pull.
 */
export function HeroMedia() {
  const chosen = useSyncExternalStore(
    noSubscription,
    heroSource,
    noSourceOnServer,
  );
  const loaded = usePageLoaded();
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
    Nothing is asked for until the page has finished loading. Mounted at
    hydration, the film was a 12MB request opened alongside the property
    images and the fonts, on a connection those are still competing for; the
    poster it fades in over is already painted by then, so nothing on screen
    is waiting for it. Deferring costs the film a second it spends fading in
    anyway, and hands that second to everything above the fold.
  */
  const src = loaded ? chosen : null;

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
      {/*
        `preload`, which is what `priority` was renamed to in Next 16: the link
        goes in the head so the poster is discovered before the parser reaches
        this element. It is the one image on the page that earns it.
      */}
      <Image
        alt={HERO_IMAGE.alt}
        className="object-cover"
        fill
        preload
        /* Under the overlay below, and the reason is in `next.config.ts`. */
        quality={60}
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

/**
 * The load event, as something to subscribe to.
 *
 * `once` is deliberately not set: React resubscribes when it needs to, and a
 * listener that removed itself after the first call would leave the store
 * with no way to report a change it had already forgotten.
 */
function subscribeToLoad(onLoad: () => void) {
  window.addEventListener("load", onLoad);

  return () => window.removeEventListener("load", onLoad);
}

/**
 * Whether the load event has already been and gone.
 *
 * Read from `readyState` rather than from a flag this hook sets itself, so a
 * visit arriving from the back forward cache or a warm cache is answered
 * correctly on the first render: `load` fired there before React ever ran,
 * and waiting for it would be waiting for something that is not coming again.
 */
const isLoaded = () => document.readyState === "complete";

/** The server has no load event, and nothing to defer. */
const notLoadedOnServer = () => false;

function usePageLoaded(): boolean {
  return useSyncExternalStore(subscribeToLoad, isLoaded, notLoadedOnServer);
}
