import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { Section, type SectionTone } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { STORY } from "@/content/story";

/**
 * Our Story, told through the eight mantras. Brief ch. 4.7.
 *
 * Four subsections, each carrying the two mantras its paragraph is about, and
 * each with a control that names where it leads. Production repeats one
 * "Discover More" on all four, which tells a visitor nothing about which of
 * the four they are about to open.
 *
 * The three photographs run as a band above the four chapters rather than one
 * per chapter, because there are three of them and four of those. Production
 * has the same three and the same mismatch, and a fourth invented image would
 * be decoration standing in for a decision.
 */
const HEADING_ID = "our-story";

export function OurStory({ tone }: { tone?: SectionTone }) {
  return (
    <Section labelledBy={HEADING_ID} tone={tone}>
      <SectionHeading
        eyebrow={STORY.eyebrow}
        heading={STORY.heading}
        headingId={HEADING_ID}
        intro={STORY.intro}
      />

      {/*
        Three across from the tablet breakpoint, and a single frame below it.
        Showing one of three on a phone is not a gallery, it is two images the
        visitor never sees, so the first is the one that stays.
      */}
      <ul className="mt-8 grid gap-5 sm:grid-cols-3 lg:mt-12 lg:gap-8">
        {STORY.images.map((image, index) => (
          <li className={index === 0 ? "" : "hidden sm:block"} key={image.src}>
            <div className="relative aspect-4/3 overflow-hidden rounded-card">
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                sizes="(min-width: 1280px) 405px, (min-width: 640px) 33vw, 100vw"
                src={image.src}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:gap-x-12 lg:gap-y-12">
        {STORY.chapters.map((chapter) => (
          <div key={chapter.heading}>
            <GoldRule />
            <h3 className="mt-4 font-heading text-h3 text-ink lg:text-h3-lg">
              {chapter.heading}
            </h3>
            {/* The mantras are the subject line of the paragraph below, so
                they sit between the heading and the copy in the eyebrow scale
                the rest of the page uses for exactly that. */}
            <p className="mt-2 text-eyebrow font-medium uppercase text-gold-dark">
              {chapter.mantras.join(" · ")}
            </p>
            <p className="mt-3 max-w-measure text-body text-ink-muted lg:text-body-lg">
              {chapter.body}
            </p>
            {/* A text link rather than a pill: four filled controls in a
                two by two grid would out-shout the one primary action the page
                gives each section. `ghost` carries no horizontal padding, so
                it stays flush with the paragraph above it. */}
            <div className="mt-4">
              <Button href={chapter.action.href} variant="ghost">
                {chapter.action.label}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
