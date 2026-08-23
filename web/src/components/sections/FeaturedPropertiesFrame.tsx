import type { ReactNode } from "react";

import { Section, type SectionTone } from "@/components/ui/Section";
import { SectionLayout } from "@/components/ui/SectionLayout";
import {
  FEATURED_PROPERTIES,
  FEATURED_PROPERTIES_ACTION,
} from "@/content/featured-properties";

interface FeaturedPropertiesFrameProps {
  children: ReactNode;
  tone?: SectionTone;
}

/**
 * Everything about the Featured Properties section that does not depend on the
 * API: the eyebrow, the heading, the intro, and the "View All Family" pill.
 *
 * It is a component rather than markup inside the section because three
 * different things go in the hole in the middle of it. The grid when the CMS
 * answers, a short line when it does not (F5), and the loading skeleton while
 * the answer is on its way. Writing the chrome out three times is how the
 * three states drift apart.
 *
 * What it deliberately does not cover is F4. Nothing published hides the
 * section outright, heading included, and that decision belongs to whoever
 * holds the data.
 *
 * The pill keeps the `ink` fill PRD ch. 6.2 asks for by name, one step louder
 * than the outlined control the ten static sections carry, because this is the
 * section the page is built around.
 */

const HEADING_ID = "featured-properties";

export function FeaturedPropertiesFrame({
  children,
  tone,
}: FeaturedPropertiesFrameProps) {
  return (
    <Section labelledBy={HEADING_ID} tone={tone}>
      <SectionLayout
        action={FEATURED_PROPERTIES_ACTION}
        actionVariant="ink"
        eyebrow={FEATURED_PROPERTIES.eyebrow}
        heading={FEATURED_PROPERTIES.heading}
        headingId={HEADING_ID}
        intro={FEATURED_PROPERTIES.intro}
      >
        {children}
      </SectionLayout>
    </Section>
  );
}
