import { Suspense } from "react";

import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import { FeaturedPropertiesContent } from "@/components/sections/FeaturedPropertiesContent";
import { FeaturedPropertiesFrame } from "@/components/sections/FeaturedPropertiesFrame";
import {
  CAROUSEL_CONTAINER,
  CAROUSEL_CONTROLS,
  CAROUSEL_SLIDE,
  CAROUSEL_VIEWPORT,
} from "@/components/ui/carouselTrack";
import type { SectionTone } from "@/components/ui/Section";
import { FEATURED_PROPERTY_COUNT } from "@/content/featured-properties";

const PLACEHOLDERS = Array.from(
  { length: FEATURED_PROPERTY_COUNT },
  (_, index) => index,
);

/**
 * Featured Properties, the one section on the homepage driven by the CMS.
 *
 * The boundary is here and the read is a level down, so the page can stream:
 * the heading and the pill are known before the API answers and are painted
 * immediately, and only the track waits. The skeleton stands in the same frame
 * and the same track as the real cards, which is what stops it from causing
 * the layout shift it exists to prevent (DESIGN-SYSTEM ch. 6.6).
 *
 * What it reproduces is the height, which is the only axis a shift can happen
 * on: the same viewport, the same slide widths, and an empty row the height of
 * the controls that will replace it. What it does not reproduce is where along
 * the track the cards sit, because a looping carousel decides that when it
 * initialises and there is no card here yet to centre.
 *
 * One consequence is worth naming: with nothing published, the frame paints
 * and then goes away when the read comes back empty (F4). Hiding the heading
 * before knowing whether there is anything to head is not possible, and an
 * empty CMS is a state a live site passes through once.
 */
export function FeaturedProperties({ tone }: { tone?: SectionTone }) {
  return (
    <Suspense
      fallback={
        <FeaturedPropertiesFrame tone={tone}>
          <div className={CAROUSEL_VIEWPORT}>
            <ul className={CAROUSEL_CONTAINER}>
              {PLACEHOLDERS.map((index) => (
                <li className={CAROUSEL_SLIDE} key={index}>
                  <PropertyCardSkeleton />
                </li>
              ))}
            </ul>
          </div>

          {/* The controls' own row, held open and left empty. There is
              nothing to step through yet, and a disabled control that is
              about to become three is worse than a gap. */}
          <div aria-hidden className={`${CAROUSEL_CONTROLS} h-11`} />
        </FeaturedPropertiesFrame>
      }
    >
      <FeaturedPropertiesContent tone={tone} />
    </Suspense>
  );
}
