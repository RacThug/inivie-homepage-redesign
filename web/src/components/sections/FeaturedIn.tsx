import Image from "next/image";

import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FEATURED_IN } from "@/content/featured-in";

/**
 * Featured In. PRD ch. 6.1 section 10.
 *
 * Eight marks, quiet, and every one of them named. Production serves nine
 * files with no alternative text at all, so a screen reader is handed nine
 * images and told nothing about any of them; `content/featured-in.ts` says
 * why the ninth is not here.
 *
 * The logos are not links. None of them is a link on production either, and
 * inventing eight outbound URLs to make the row feel interactive would be
 * inventing eight facts.
 */
const HEADING_ID = "featured-in";

export function FeaturedIn() {
  return (
    <Section labelledBy={HEADING_ID} tone="alt">
      <SectionHeading
        align="center"
        eyebrow={FEATURED_IN.eyebrow}
        heading={FEATURED_IN.heading}
        headingId={HEADING_ID}
      />

      {/*
        Two across on a phone, four from the tablet breakpoint, which lands
        eight as two clean rows at every width. `object-contain` inside a fixed
        box is what keeps marks of very different proportions optically level:
        a wordmark six times as wide as a monogram cannot share a width.
      */}
      <ul className="mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-4 lg:mt-14">
        {FEATURED_IN.publications.map((publication) => (
          <li className="relative h-10 lg:h-12" key={publication.name}>
            <Image
              alt={publication.name}
              className="object-contain opacity-70"
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              src={publication.logo}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
