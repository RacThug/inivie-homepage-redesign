import { Button } from "@/components/ui/Button";
import { Section, type SectionTone } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MEMBERSHIP, type BenefitIcon } from "@/content/membership";

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
                <BenefitMark icon={benefit.icon} />
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

/**
 * The mark above a benefit. Production draws four filled accent discs here;
 * these are the same four ideas in the register the rest of the page uses, at
 * the 28px single stroke DESIGN-SYSTEM ch. 6.11 sets for them.
 *
 * They are `gold`, which is what ch. 2.1 gives gold to do: rules, dividers and
 * markers, and it is legible on ink at 6.87 to 1. Accent is ruled out for a
 * different reason than contrast, ch. 2.3: it belongs to controls, and this
 * panel already carries the one control that matters.
 *
 * A short gold rule stood here until this replaced it (ch. 6.11). The
 * objection recorded against icons was that four of them are four decisions
 * about what a "celebration setup" looks like, which is true and is the work
 * rather than a reason to avoid it: a gift, a gem, a tag and a calendar are
 * the four the live site already made, and each one is legible at 28px with
 * nothing written inside it.
 *
 * Decorative, and hidden from assistive technology. The benefit is written
 * out in full beneath every one of them, so an icon that announced itself
 * would say the same thing twice.
 */
const MARKS: Record<BenefitIcon, string> = {
  /* A cut gem: crown, girdle, and the facets meeting at the point. */
  gem: "M6 3h12l3 6-9 12-9-12zM3 9h18M9 9l3 12 3-12M6 3l3 6M18 3l-3 6",
  /* A wrapped box, its ribbon carried through the lid and tied above it. */
  gift: "M3 8h18v3.5H3zM4.5 11.5V21h15v-9.5M12 8v13M12 8c-1-2.2-2-3.6-3.6-3.6a1.8 1.8 0 0 0 0 3.6zM12 8c1-2.2 2-3.6 3.6-3.6a1.8 1.8 0 0 1 0 3.6z",
  /* A price tag, hung by the eyelet the dot stands for. */
  tag: "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V4.5a1.5 1.5 0 0 1 1.5-1.5h7.7c.5 0 1 .2 1.4.6l7 7a2 2 0 0 1 0 2.8z",
  /* A month, with one day marked. */
  calendar: "M3.5 6h17v14.5h-17zM3.5 10.5h17M8 3.5V7M16 3.5V7",
};

/** The one mark that needs a filled shape rather than a stroke. */
const DOTS: Partial<Record<BenefitIcon, { cx: number; cy: number }>> = {
  tag: { cx: 7.5, cy: 7.5 },
  calendar: { cx: 12, cy: 15.5 },
};

function BenefitMark({ icon }: { icon: BenefitIcon }) {
  const dot = DOTS[icon];

  return (
    <svg
      aria-hidden
      className="text-gold"
      fill="none"
      height="28"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="28"
    >
      <path d={MARKS[icon]} />
      {dot ? (
        <circle cx={dot.cx} cy={dot.cy} fill="currentColor" r="1.5" />
      ) : null}
    </svg>
  );
}
