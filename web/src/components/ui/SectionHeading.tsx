interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  /** Kept configurable so a page never skips a heading level. */
  level?: 1 | 2 | 3;
  /** Lets the surrounding landmark name itself from the heading it already
   *  shows, rather than repeating the words in an `aria-label`. */
  headingId?: string;
}

/**
 * Eyebrow, heading, then optional intro. DESIGN-SYSTEM ch. 6.2.
 *
 * It deliberately does not place a section's secondary control. That control
 * sits on the heading row on desktop but below the section's *content* on
 * mobile, once the visitor has been through the cards, and those are two
 * different parents: no prop on a heading component can put a child after
 * markup the heading component does not own. Attempting it lands the control
 * above the grid on a phone, which asks somebody who has just scrolled the
 * whole section to scroll back up for the way out of it.
 *
 * So the section owns the placement and this owns the copy. `FeaturedProperties
 * Frame` is the worked example.
 */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  level = 2,
  headingId,
}: SectionHeadingProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";

  return (
    <div>
      {/*
        `gold` fails AA on a light surface, so eyebrow text uses the darkened
        token. See DESIGN-SYSTEM ch. 2.2.
      */}
      <span className="block text-eyebrow font-medium uppercase text-gold-dark">
        {eyebrow}
      </span>
      <Heading
        className="mt-3 font-heading text-h2 text-ink lg:mt-4 lg:text-h2-lg"
        id={headingId}
      >
        {heading}
      </Heading>
      {intro ? (
        <p className="mt-3 max-w-measure text-body text-ink-muted lg:mt-4 lg:text-body-lg">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
