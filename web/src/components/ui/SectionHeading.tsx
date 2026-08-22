import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  /** An optional secondary link, right aligned from the desktop breakpoint. */
  action?: ReactNode;
  /** Kept configurable so a page never skips a heading level. */
  level?: 1 | 2 | 3;
}

/**
 * Eyebrow, heading, then optional intro. DESIGN-SYSTEM ch. 6.2.
 *
 * The action follows the copy in the DOM, so on mobile it simply falls below
 * it. Only from the desktop breakpoint does it move onto the heading row,
 * because a right aligned link beside a wrapped heading looks broken at narrow
 * widths.
 */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  action,
  level = 2,
}: SectionHeadingProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div>
        {/*
          `gold` fails AA on a light surface, so eyebrow text uses the darkened
          token. See DESIGN-SYSTEM ch. 2.2.
        */}
        <span className="block text-eyebrow font-medium uppercase text-gold-dark">
          {eyebrow}
        </span>
        <Heading className="mt-3 font-heading text-h2 text-ink lg:mt-4 lg:text-h2-lg">
          {heading}
        </Heading>
        {intro ? (
          <p className="mt-3 max-w-measure text-body text-ink-muted lg:mt-4 lg:text-body-lg">
            {intro}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
