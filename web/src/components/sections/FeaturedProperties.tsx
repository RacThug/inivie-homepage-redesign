import { Suspense } from "react";

import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import { FeaturedPropertiesContent } from "@/components/sections/FeaturedPropertiesContent";
import { FeaturedPropertiesFrame } from "@/components/sections/FeaturedPropertiesFrame";
import { CardGrid } from "@/components/ui/CardGrid";
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
 * immediately, and only the grid waits. The skeleton stands in the same frame
 * and the same grid as the real cards, which is what stops it from causing
 * the layout shift it exists to prevent (DESIGN-SYSTEM ch. 6.6).
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
          <CardGrid>
            {PLACEHOLDERS.map((index) => (
              <li key={index}>
                <PropertyCardSkeleton />
              </li>
            ))}
          </CardGrid>
        </FeaturedPropertiesFrame>
      }
    >
      <FeaturedPropertiesContent tone={tone} />
    </Suspense>
  );
}
