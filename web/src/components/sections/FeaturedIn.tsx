import Image from "next/image";

import { Section, type SectionTone } from "@/components/ui/Section";
import { FEATURED_IN } from "@/content/featured-in";

/**
 * Featured In. PRD ch. 6.1 section 10.
 *
 * Eight marks, quiet, and every one of them named. Production serves nine
 * files with no alternative text at all, so a screen reader is handed nine
 * images and told nothing; `content/featured-in.ts` says why the ninth is not
 * here.
 *
 * The logos are not links. None of them is a link on production either, and
 * inventing eight outbound URLs to make the row feel interactive would be
 * inventing eight facts.
 *
 * It does not use `SectionHeading`, because it has no heading in the sense
 * that component means. Production and the design pass both give this section
 * one small label and nothing under it, so the label is the heading, set at
 * the eyebrow scale. Writing a sentence to fill the gap would have been
 * placeholder copy with a design system's clothes on.
 */
const HEADING_ID = "featured-in";

export function FeaturedIn({ tone }: { tone?: SectionTone }) {
  return (
    <Section labelledBy={HEADING_ID} tone={tone}>
      <h2
        className="text-eyebrow font-medium uppercase text-gold-dark"
        id={HEADING_ID}
      >
        {FEATURED_IN.heading}
      </h2>

      {/*
        Two across on a phone, four from the tablet breakpoint, which lands
        eight as two clean rows at every width. `object-contain` inside a fixed
        box is what keeps marks of very different proportions optically level:
        a wordmark six times as wide as a monogram cannot share a width.

        `grayscale` is set rather than assumed. The eight files happen to be
        monochrome already, so the filter changes nothing today, and it is the
        reason a coloured ninth could not arrive and quietly break the row.
      */}
      <ul className="mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-4 lg:mt-12">
        {FEATURED_IN.publications.map((publication) => (
          <li className="relative h-10 lg:h-12" key={publication.name}>
            <Image
              alt={publication.name}
              className="object-contain opacity-70 grayscale"
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
