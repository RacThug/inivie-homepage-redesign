import Image from "next/image";

import { Section, type SectionTone } from "@/components/ui/Section";
import { FEATURED_IN } from "@/content/featured-in";

/**
 * Featured In. PRD ch. 6.1 section 10, DESIGN-SYSTEM ch. 6.14.
 *
 * Eight marks, quiet, and every one of them named. Production serves nine
 * files with no alternative text at all, so a screen reader is handed nine
 * images and told nothing; `content/featured-in.ts` says why the ninth is not
 * here.
 *
 * Production runs the row as a Swiper with autoplay, and it is one of the
 * three carousels PRD ch. 2 catalogues for moving on their own with no
 * `prefers-reduced-motion` query behind any of them. The movement is kept and
 * the query is added: a ribbon says there are more of these than fit, which a
 * static row of eight cannot, and a visitor who has asked their operating
 * system for stillness never sees it move.
 *
 * There is no Swiper here and no Embla, and no JavaScript at all: the ribbon
 * is a CSS animation over a track that holds the eight marks twice, so
 * translating it by exactly half its width returns it to where it began and
 * the loop has no seam.
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
        The window. `overflow-hidden` is what makes the track a ribbon rather
        than a very wide row, and the mask fades both ends so a mark leaves the
        frame instead of being cut in half at it, the same treatment the
        carousel's edges take in ch. 6.17.
      */}
      <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_3rem,#000_calc(100%-3rem),transparent)] lg:mt-8">
        {/*
          `w-max` so the track is as wide as its contents rather than as wide
          as the window, which is what the 50% translation is measured
          against.

          `marquee` carries the animation and both of the things that stop
          it, hovering and reduced motion, for the reason given where it is
          defined: `animation` is a shorthand that resets the play state, so
          the two cannot be separate classes on this element.
        */}
        <div className="marquee flex w-max">
          <MarkRow />
          {/*
            The second copy carries the seam. It is hidden from assistive
            technology, which would otherwise be read sixteen marks for a row
            that shows eight.
          */}
          <div aria-hidden>
            <MarkRow />
          </div>
        </div>
      </div>
    </Section>
  );
}

/**
 * Every mark sits in a fixed box with `object-contain`, which is what keeps
 * proportions this different optically level: a wordmark six times as wide as
 * a monogram cannot share a width.
 *
 * `grayscale` is set rather than assumed. The eight files happen to be
 * monochrome already, so the filter changes nothing today, and it is the
 * reason a coloured ninth could not arrive and quietly break the row.
 *
 * A hovered mark lifts 4px, comes up to full strength, and casts a soft
 * shadow. The shadow is the part that makes it read as raised rather than as
 * merely brighter: `drop-shadow` follows the glyph rather than a box, so a
 * wordmark on a transparent file lifts by its own outline. It is set alongside
 * `grayscale` and composes with it, both being filters.
 *
 * It is the one place on this page where motion is neither an entrance nor a
 * state change, and it earns its place by answering the question the greyscale
 * creates: a row of faded marks invites a visitor to look closer at one, and
 * this is the row letting them.
 */
function MarkRow() {
  return (
    <ul className="flex shrink-0 items-center">
      {FEATURED_IN.publications.map((publication) => (
        <li
          className="group relative mx-5 h-10 w-32 transition-transform hover:-translate-y-1 lg:mx-7 lg:h-12 lg:w-40"
          key={publication.name}
        >
          <Image
            alt={publication.name}
            className="object-contain opacity-70 grayscale transition-[opacity,filter] group-hover:opacity-100 group-hover:drop-shadow-[0_4px_6px_rgb(28_36_52_/_0.20)]"
            fill
            sizes="(min-width: 1024px) 160px, 128px"
            src={publication.logo}
          />
        </li>
      ))}
    </ul>
  );
}
