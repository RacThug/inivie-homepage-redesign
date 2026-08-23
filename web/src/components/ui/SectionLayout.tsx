import type { ReactNode } from "react";

import { Button, type ButtonVariant } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface SectionAction {
  readonly label: string;
  readonly href: string;
}

interface SectionLayoutProps {
  eyebrow: string;
  heading: string;
  intro?: string;
  headingId: string;
  /** Omitted where a section leads nowhere, which on this page is the FAQ and
   *  Featured In. A control that exists only for symmetry is a control that
   *  competes with the one that matters. */
  action?: SectionAction;
  actionVariant?: ButtonVariant;
  children: ReactNode;
}

/**
 * A section header, its one secondary control, and its content, laid out so
 * that the control can sit in two different places without being written into
 * the document twice. DESIGN-SYSTEM ch. 6.2.
 *
 * On a phone the control is placed last, after the content: a visitor who has
 * scrolled the whole section is then looking at the way out of it, rather than
 * being sent back up past three cards to find it. From the desktop breakpoint
 * the explicit row and column put it back on the heading row, where there is
 * room for it beside a heading that no longer wraps.
 *
 * Two copies under `hidden`/`lg:hidden` would do the same job and are the
 * usual way this is done. One document, moved by `order`, is a better one:
 * there is only ever a single control to keep in step, and nothing an
 * assistive technology has to be told to skip.
 *
 * This was `FeaturedPropertiesFrame`'s body until five sections needed it.
 */
export function SectionLayout({
  eyebrow,
  heading,
  intro,
  headingId,
  action,
  actionVariant = "secondary",
  children,
}: SectionLayoutProps) {
  return (
    <div className="grid gap-y-8 lg:grid-cols-[1fr_auto] lg:gap-x-8 lg:gap-y-12">
      <div className="lg:col-start-1 lg:row-start-1">
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          headingId={headingId}
          intro={intro}
        />
      </div>

      {/* `justify-self-start` because a grid cell stretches its child, and a
          full width pill on a phone would out-shout the call to action on
          every card below it. */}
      {action ? (
        <div className="order-last justify-self-start lg:order-none lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-end">
          <Button href={action.href} variant={actionVariant}>
            {action.label}
          </Button>
        </div>
      ) : null}

      <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
        {children}
      </div>
    </div>
  );
}
