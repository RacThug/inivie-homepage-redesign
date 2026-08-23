import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCarousel } from "@/components/property/PropertyCarousel";
import { FeaturedPropertiesFrame } from "@/components/sections/FeaturedPropertiesFrame";
import type { SectionTone } from "@/components/ui/Section";
import {
  FEATURED_PROPERTIES,
  FEATURED_PROPERTY_COUNT,
} from "@/content/featured-properties";
import { fetchProperties } from "@/lib/api/properties";

/**
 * The dynamic half of the section: the CMS read, and the three states it can
 * come back in.
 *
 * A Server Component, so the API is called server side. It never throws:
 * `fetchProperties` answers with a flag instead, which is what keeps a failing
 * section from taking the other eleven down with it.
 *
 * The cards are built here and handed to the carousel as rendered output, not
 * as data. A Server Component passed as a prop is not part of the client
 * component's module graph, so the carousel is the only JavaScript this
 * section ships: `PropertyCard`, `next/image` and the property payload all
 * stay on the server (TECHNICAL-DESIGN ch. 3.1).
 */
export async function FeaturedPropertiesContent({
  tone,
}: { tone?: SectionTone } = {}) {
  const { properties, unavailable } = await fetchProperties(
    FEATURED_PROPERTY_COUNT,
  );

  /**
   * F4. Zero published properties is a valid state, not an error, and the
   * answer to it is that the section was never here: heading, intro and
   * control go with the cards, leaving no empty gap on the page.
   */
  if (!unavailable && properties.length === 0) {
    return null;
  }

  return (
    <FeaturedPropertiesFrame tone={tone}>
      {unavailable ? (
        /**
         * F5. Quiet, and it keeps its own counsel about why: a visitor cannot
         * act on a status code. The section's own "View All Family" pill is
         * already on the page and leads exactly where this line points, so
         * the panel carries no second control of its own.
         */
        <div className="rounded-card border border-border bg-surface-alt p-8">
          <p className="max-w-measure text-body text-ink-muted lg:text-body-lg">
            {FEATURED_PROPERTIES.unavailable}
          </p>
        </div>
      ) : (
        <PropertyCarousel
          slides={properties.map((property) => ({
            id: property.id,
            label: property.title,
            card: <PropertyCard property={property} />,
          }))}
        />
      )}
    </FeaturedPropertiesFrame>
  );
}
