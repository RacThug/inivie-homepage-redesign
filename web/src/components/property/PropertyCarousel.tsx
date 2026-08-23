"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  CAROUSEL_CONTAINER,
  CAROUSEL_CONTROLS,
  CAROUSEL_SLIDE,
  CAROUSEL_VIEWPORT,
} from "@/components/property/track";
import { FEATURED_PROPERTIES_CAROUSEL } from "@/content/featured-properties";

export interface CarouselSlide {
  /** The property id, so re-ordering moves a card rather than rebuilding it. */
  id: number;
  /**
   * The property name. It is what a control says it will scroll to, so six
   * dots are told apart by a screen reader rather than counted.
   */
  label: string;
  card: ReactNode;
}

interface PropertyCarouselProps {
  slides: CarouselSlide[];
}

/**
 * Featured Properties as a centre mode carousel: the selected card sits in the
 * middle of the track at full size, with its neighbours showing at both edges
 * and standing slightly smaller. DESIGN-SYSTEM ch. 6.17.
 *
 * This is the only client component the section has, and it holds no property
 * data. The cards arrive already rendered, as `card`, so `PropertyCard` and
 * `next/image` stay on the server and what ships to a browser is the carousel
 * and nothing else.
 *
 * There is no auto-rotation, deliberately. PRD ch. 2 catalogues three Swiper
 * carousels on the production site that move on their own with no
 * `prefers-reduced-motion` query behind them, and a redesign that reproduces
 * the defect it recorded is worse than one that never had the feature. The
 * track moves when a visitor moves it, and nothing here starts a timer.
 */

/**
 * Embla loops by translating the real slides rather than by cloning them,
 * which needs the track to be able to cover the viewport twice over. At the
 * narrowest slide width, 36% of the viewport, six slides is where that becomes
 * true, and below it the loop leaves a gap at the seam. F3 permits as few as
 * three, so the option is read from the data rather than assumed, and a short
 * track stops at its ends instead.
 */
const LOOP_MINIMUM_SLIDES = 6;

/**
 * Read at the moment of the scroll rather than held in state, because the two
 * ways this can change - the operating system setting, and a visitor moving
 * the window to another display - both happen between clicks, and neither one
 * re-renders anything.
 *
 * `globals.css` collapses every CSS transition under the same query, so what
 * is left for this to cover is the one piece of motion CSS cannot see: the
 * animation Embla runs itself, which `jump` turns into an instant move.
 */
function jumps(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PropertyCarousel({ slides }: PropertyCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "center",
    /**
     * The first and last cards are centred too, with empty track beside them,
     * which is what `containScroll` would otherwise clamp away. Without this a
     * carousel that does not loop starts flush left, and the centre mode would
     * only be true in the middle of the run.
     */
    containScroll: false,
    loop: slides.length >= LOOP_MINIMUM_SLIDES,
    /**
     * A card off the side of the track is still in the document and still in
     * the tab order, which is right: its call to action is a link a keyboard
     * reaches. This is what then brings the card it reached into view, rather
     * than leaving focus on something clipped out of sight.
     */
    watchFocus: true,
  });

  const [selected, setSelected] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  /**
   * The track is positioned with a transform, and `scrollLeft` is meant to
   * stay at zero for the life of the carousel. A browser does not know that:
   * `overflow: hidden` still scrolls, and a browser scrolls a box of its own
   * accord whenever something inside it needs to be seen. Find-in-page onto a
   * clipped card does it, and so does any script that moves focus.
   *
   * A scroll Embla did not make displaces every slide from the position the
   * dots claim, and nothing puts it back: the carousel goes on animating from
   * a baseline that is no longer where the visitor is looking. Embla undoes it
   * for the one case it can recognise, a slide focused within 10ms of a Tab
   * press, and that path is verified. This holds the other ones.
   */
  const viewport = useRef<HTMLDivElement | null>(null);
  const setViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewport.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  useEffect(() => {
    const node = viewport.current;

    if (!node) return;

    const pin = () => {
      node.scrollLeft = 0;
    };

    node.addEventListener("scroll", pin);

    return () => node.removeEventListener("scroll", pin);
  }, []);

  useEffect(() => {
    if (!embla) return;

    const sync = () => {
      setSelected(embla.selectedScrollSnap());
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    sync();
    embla.on("select", sync).on("reInit", sync);

    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla]);

  const scrollTo = useCallback(
    (index: number) => embla?.scrollTo(index, jumps()),
    [embla],
  );
  const scrollPrev = useCallback(() => embla?.scrollPrev(jumps()), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(jumps()), [embla]);

  return (
    /*
     * Named as a carousel, rather than given the roles of a one-slide-at-a-time
     * one. Every card is in the document, visible, and reachable by tab, so the
     * list below stays a list: a screen reader says how many properties there
     * are before reading the first, which is the more useful sentence. The
     * label omits the word carousel, which `aria-roledescription` already
     * supplies and which would otherwise be announced twice.
     */
    <div
      aria-label={FEATURED_PROPERTIES_CAROUSEL.label}
      aria-roledescription="carousel"
      role="group"
    >
      <div className={CAROUSEL_VIEWPORT} ref={setViewport}>
        <ul className={CAROUSEL_CONTAINER}>
          {slides.map((slide, index) => (
            <li className={CAROUSEL_SLIDE} key={slide.id}>
              {/*
                The scale sits on a wrapper rather than on the slide itself,
                because in a looping track Embla writes its own `transform`
                onto every slide node and would overwrite anything set there.

                Scale alone, with no dimming. Fading the neighbours is the
                usual other half of this effect and it is left out on purpose:
                it would put `ink-muted` body copy below the AA contrast
                ch. 2.2 measures it at, and a card a visitor can read is worth
                more than a card that looks further away.
              */}
              <div
                className={`h-full origin-center transition-transform ${
                  index === selected ? "scale-100" : "scale-[0.94]"
                }`}
              >
                {slide.card}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={CAROUSEL_CONTROLS}>
        <Step
          disabled={!canScrollPrev}
          label={FEATURED_PROPERTIES_CAROUSEL.previous}
          onClick={scrollPrev}
        />

        {/*
          A list, because that is what these are, and each one is a way to
          reach a named property rather than a numbered position.
        */}
        <ul className="flex items-center">
          {slides.map((slide, index) => (
            <li key={slide.id}>
              <Dot
                label={FEATURED_PROPERTIES_CAROUSEL.goTo(slide.label)}
                onClick={() => scrollTo(index)}
                selected={index === selected}
              />
            </li>
          ))}
        </ul>

        <Step
          disabled={!canScrollNext}
          label={FEATURED_PROPERTIES_CAROUSEL.next}
          next
          onClick={scrollNext}
        />
      </div>
    </div>
  );
}

/**
 * One step of the track, and the one control the phone does not get. Six dots
 * at the 44 by 44 of RS2 already fill the width of a 375px screen, and a swipe
 * is the gesture a touch device brings of its own; from the tablet breakpoint
 * there is room, and a pointer has no gesture to bring.
 *
 * It carries no visible text, so its accessible name is the whole of what it
 * says, and it names what it moves rather than which way: "Next property" is
 * an answer where "Next" is half of one.
 *
 * `disabled` is real rather than styled. It can only happen on a track too
 * short to loop, where a control that scrolls nowhere should say so.
 */
function Step({
  label,
  next = false,
  disabled,
  onClick,
}: {
  label: string;
  next?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="hidden h-11 w-11 flex-none items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-muted disabled:hover:bg-transparent sm:flex"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <svg
        aria-hidden
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 16 16"
        width="16"
      >
        <path d={next ? "M6 3.5L10.5 8L6 12.5" : "M10 3.5L5.5 8L10 12.5"} />
      </svg>
    </button>
  );
}

/**
 * The 44 by 44 of RS2 is the button, not the mark inside it. A visitor sees an
 * 8px dot that grows into a short bar when it is the one selected, and a thumb
 * gets the target the requirement asks for.
 *
 * It narrows from the tablet breakpoint, where the requirement no longer
 * applies and a pointer is what is aiming: six targets held at 44 leave the
 * row of dots spread wider than the controls either side of it, which reads as
 * six separate controls rather than as one scale.
 */
function Dot({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={selected}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-8"
      onClick={onClick}
      type="button"
    >
      <span
        className={`h-2 rounded-full transition-all ${
          selected ? "w-5 bg-ink" : "w-2 bg-border"
        }`}
      />
    </button>
  );
}
