import { Carousel } from "@/components/ui/Carousel";
import { Section, type SectionTone } from "@/components/ui/Section";
import { SectionLayout } from "@/components/ui/SectionLayout";
import { VenueCard } from "@/components/venue/VenueCard";
import type { VenueSectionContent } from "@/content/venues";

interface VenueSectionProps {
  content: VenueSectionContent;
  headingId: string;
  tone?: SectionTone;
}

/**
 * The Culinary Journey and Wellness Harmony Escape, which are the same section
 * twice with different content.
 *
 * Writing them out separately would let them drift, and the brief ch. 4.5 asks
 * for the opposite: the two must read as a pair rather than as two unrelated
 * treatments. One component is the strongest way to guarantee that, and it
 * costs the two thin wrappers beside this file, each of which owns nothing but
 * the choice of which content module to read.
 */
export function VenueSection({ content, headingId, tone }: VenueSectionProps) {
  return (
    <Section labelledBy={headingId} tone={tone}>
      <SectionLayout
        action={content.action}
        eyebrow={content.eyebrow}
        heading={content.heading}
        headingId={headingId}
        intro={content.intro}
      >
        {/*
          The same track Featured Properties rides (DESIGN-SYSTEM ch. 6.17).
          The name is the key here rather than an id, because these venues are
          static content with no id to give: the module is the record, and two
          venues sharing a name would be one venue listed twice.
        */}
        <Carousel
          labels={content.carousel}
          slides={content.venues.map((venue) => ({
            id: venue.name,
            label: venue.name,
            card: <VenueCard venue={venue} />,
          }))}
        />
      </SectionLayout>
    </Section>
  );
}
