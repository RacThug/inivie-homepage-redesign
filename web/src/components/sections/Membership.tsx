import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { Section, type SectionTone } from "@/components/ui/Section";
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
 * Full bleed, like production's block and unlike a card. A contained panel
 * leaves the page's ground running down both sides of the one section that is
 * supposed to interrupt it, which reads as a large card rather than as a
 * change of register.
 *
 * Two columns from the desktop breakpoint, copy left and benefits right. One
 * column with the benefits strung along the bottom leaves the top right of the
 * panel empty, which is what makes the section read as unfinished at 1440.
 */
const HEADING_ID = "membership";

export function Membership({ tone }: { tone?: SectionTone }) {
  return (
    <Section labelledBy={HEADING_ID} tone={tone}>
      <div className="py-2 lg:py-6">
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

            {/* `items-start` so the pair keeps its own width on a phone. A
                stretched column would centre the text link under a full width
                button, which reads as a caption rather than as a control, and
                every other section on the page sets its controls at their own
                width too. */}
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button href={MEMBERSHIP.primary.href}>
                {MEMBERSHIP.primary.label}
              </Button>
              {/* `ghost` on a dark tone, which resolves to the one colour
                  that carries text on ink, and inverts the focus ring with it
                  (DESIGN-SYSTEM ch. 6.3). */}
              <Button
                href={MEMBERSHIP.secondary.href}
                tone="dark"
                variant="ghost"
              >
                {MEMBERSHIP.secondary.label}
              </Button>
            </div>
          </div>

          {/* Two by two from the tablet breakpoint, centred against the copy
              beside it rather than pinned to its top or spread to its full
              height. Pinned leaves the corner brief ch. 4.6 is about; spread
              leaves a hole through the middle and reads as two pairs.

              A list, so the count is announced before the first benefit. */}
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:gap-y-12 lg:self-center">
            {MEMBERSHIP.benefits.map((benefit) => (
              <li key={benefit.title}>
                <GoldRule />
                <p className="mt-3 text-body font-medium text-surface lg:text-body-lg">
                  {benefit.title}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
