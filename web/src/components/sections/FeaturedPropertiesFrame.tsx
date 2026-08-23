import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  FEATURED_PROPERTIES,
  FEATURED_PROPERTIES_ACTION,
} from "@/content/featured-properties";

interface FeaturedPropertiesFrameProps {
  children: ReactNode;
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
 */

const HEADING_ID = "featured-properties";

export function FeaturedPropertiesFrame({
  children,
}: FeaturedPropertiesFrameProps) {
  return (
    <section aria-labelledby={HEADING_ID} className="py-16 lg:py-24">
      <Container>
        {/*
          One grid holding three things, so the pill can sit in two different
          places without being written into the document twice.

          On a phone it is placed last, after the cards: a visitor who has
          scrolled the whole section is then looking at the way out of it,
          rather than being sent back up past three cards to find it. From the
          desktop breakpoint the explicit row and column put it back on the
          heading row, where DESIGN-SYSTEM ch. 6.2 wants it and where there is
          room for it beside a heading that no longer wraps.

          Two copies under `hidden`/`lg:hidden` would do the same job and are
          the usual way this is done. One document, moved by `order`, is a
          better one: there is only ever a single control to keep in step, and
          nothing an assistive technology has to be told to skip.
        */}
        <div className="grid gap-y-8 lg:grid-cols-[1fr_auto] lg:gap-x-8 lg:gap-y-12">
          <div className="lg:col-start-1 lg:row-start-1">
            <SectionHeading
              eyebrow={FEATURED_PROPERTIES.eyebrow}
              heading={FEATURED_PROPERTIES.heading}
              headingId={HEADING_ID}
              intro={FEATURED_PROPERTIES.intro}
            />
          </div>

          {/* `justify-self-start` because a grid cell stretches its child, and
              a full width ink pill on a phone would out-shout the accent
              button on every card below it. */}
          <div className="order-last justify-self-start lg:order-none lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-end">
            <Button href={FEATURED_PROPERTIES_ACTION.href} variant="ink">
              {FEATURED_PROPERTIES_ACTION.label}
            </Button>
          </div>

          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
