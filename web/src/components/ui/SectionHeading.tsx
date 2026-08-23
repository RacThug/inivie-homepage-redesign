export type HeadingTone = "light" | "dark";

interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  /** Kept configurable so a page never skips a heading level. */
  level?: 1 | 2 | 3;
  /** Lets the surrounding landmark name itself from the heading it already
   *  shows, rather than repeating the words in an `aria-label`. */
  headingId?: string;
  /**
   * Centred is the exception, not a preference. It is correct where a section
   * has no second column to pair with, which on this page is the FAQ (brief
   * ch. 4.11). Everywhere else a centred header over a left aligned grid
   * leaves the eye with two different starting points.
   */
  align?: "start" | "center";
  /** On the membership panel the ground is `ink`, and every colour below
   *  inverts. Gold carries text there at 6.87 to 1, which is the one surface
   *  on the site where it may. */
  tone?: HeadingTone;
}

/**
 * Eyebrow, heading, then optional intro. DESIGN-SYSTEM ch. 6.2.
 *
 * It deliberately does not place a section's secondary control. That control
 * sits on the heading row on desktop but below the section's *content* on
 * mobile, once the visitor has been through the cards, and those are two
 * different parents: no prop on a heading component can put a child after
 * markup the heading component does not own. `SectionLayout` owns that
 * placement; this owns the copy.
 */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  level = 2,
  headingId,
  align = "start",
  tone = "light",
}: SectionHeadingProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";
  const centred = align === "center";
  const dark = tone === "dark";

  return (
    <div className={centred ? "text-center" : undefined}>
      {/*
        `gold` fails AA on a light surface, so eyebrow text uses the darkened
        token there and the undarkened one on ink. See DESIGN-SYSTEM ch. 2.2.
      */}
      <span
        className={`block text-eyebrow font-medium uppercase ${
          dark ? "text-gold" : "text-gold-dark"
        }`}
      >
        {eyebrow}
      </span>
      <Heading
        className={`mt-3 font-heading text-h2 lg:mt-4 lg:text-h2-lg ${
          dark ? "text-surface" : "text-ink"
        }`}
        id={headingId}
      >
        {heading}
      </Heading>
      {intro ? (
        <p
          className={`mt-3 max-w-measure text-body lg:mt-4 lg:text-body-lg ${
            dark ? "text-on-ink-muted" : "text-ink-muted"
          } ${centred ? "mx-auto" : ""}`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
