import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MEMBERSHIP } from "@/content/membership";

/**
 * WeInivie Membership, the one dark panel on the page.
 *
 * Production makes this a full bleed orange block. DESIGN-SYSTEM ch. 2.3
 * forbids accent as a large fill, and white on accent measures 2.39 to 1, so
 * the section that needs the most emphasis takes it from `ink` instead. The
 * brief ch. 4.6 asks that this not be "corrected" back towards production.
 *
 * Two columns from the desktop breakpoint, copy left and benefits right. One
 * column with the benefits strung along the bottom leaves the top right of the
 * panel empty, which is what makes the section read as unfinished at 1440.
 */
const HEADING_ID = "membership";

export function Membership() {
  return (
    <Section labelledBy={HEADING_ID} tone="alt">
      <div className="rounded-card bg-ink p-8 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={MEMBERSHIP.eyebrow}
              heading={MEMBERSHIP.heading}
              headingId={HEADING_ID}
              tone="dark"
            />
            {/* The tagline is the brand line, so it keeps `surface` and the
                paragraph below it drops to the secondary token. Two levels of
                text on a dark ground, the same two the footer uses. */}
            <p className="mt-4 max-w-measure text-body font-medium text-surface lg:mt-6 lg:text-body-lg">
              {MEMBERSHIP.tagline}
            </p>
            <p className="mt-3 max-w-measure text-body text-on-ink-muted lg:text-body-lg">
              {MEMBERSHIP.body}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={MEMBERSHIP.primary.href}>
                {MEMBERSHIP.primary.label}
              </Button>
              {/* The `ghost` variant is `ink` text, which disappears here, so
                  the second control is drawn on the panel's own terms: a gold
                  label with the same underline on hover. */}
              <a
                className="inline-flex min-h-11 items-center text-small font-medium text-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                href={MEMBERSHIP.secondary.href}
              >
                {MEMBERSHIP.secondary.label}
              </a>
            </div>
          </div>

          {/* Two by two from the tablet breakpoint, centred against the copy
              beside it rather than pinned to its top or spread to its full
              height. Pinned leaves the corner brief ch. 4.6 is about; spread
              leaves a hole through the middle and reads as two pairs.

              A list, so the count is announced before the first benefit. */}
          <ul className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:gap-y-10 lg:self-center">
            {MEMBERSHIP.benefits.map((benefit) => (
              <li className="flex gap-3" key={benefit.title}>
                <MarkerIcon />
                <span className="text-body text-surface lg:text-body-lg">
                  {benefit.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/**
 * One marker, repeated. Four drawn icons would be four decisions about what a
 * "celebration setup" looks like, and DESIGN-SYSTEM ch. 5 has no budget for
 * decoration. Gold is a marker colour by ch. 2.1, which is exactly this.
 */
function MarkerIcon() {
  return (
    <svg
      aria-hidden
      className="mt-1 flex-none text-gold"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 18 18"
      width="18"
    >
      <path d="m3.5 9.5 3.5 3.5 7.5-8" />
    </svg>
  );
}
