export type HeadingTone = "light" | "dark";

/**
 * Every colour this component sets, per ground. `gold` fails AA on a light
 * surface at 2.26 to 1, so the eyebrow uses the darkened token there and the
 * undarkened one on ink, where it reaches 6.87 to 1 (DESIGN-SYSTEM ch. 2.2).
 *
 * A table rather than three separate conditionals on one flag: a fourth line
 * of text arriving here should be one row to fill in, not a fourth place to
 * remember the rule.
 */
const TONES: Record<
  HeadingTone,
  { eyebrow: string; heading: string; intro: string }
> = {
  light: {
    eyebrow: "text-gold-dark",
    heading: "text-ink",
    intro: "text-ink-muted",
  },
  dark: {
    eyebrow: "text-gold",
    heading: "text-surface",
    intro: "text-on-ink-muted",
  },
};

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
  const colours = TONES[tone];

  return (
    <div className={centred ? "text-center" : undefined}>
      <span
        className={`block text-eyebrow font-medium uppercase ${colours.eyebrow}`}
      >
        {eyebrow}
      </span>
      <Heading
        className={`mt-3 font-heading text-h2 lg:mt-4 lg:text-h2-lg ${colours.heading}`}
        id={headingId}
      >
        {heading}
      </Heading>
      {intro ? (
        <p
          className={`mt-3 max-w-measure text-body lg:mt-4 lg:text-body-lg ${
            colours.intro
          } ${centred ? "mx-auto" : ""}`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
