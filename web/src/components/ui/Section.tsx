import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";

export type SectionTone = "surface" | "alt";

interface SectionProps {
  children: ReactNode;
  /**
   * Alternating grounds are what make ten stacked sections read as one page
   * rather than ten. `page.tsx` alternates them strictly, so a section never
   * decides its own ground and two neighbours can never end up the same.
   */
  tone?: SectionTone;
  /** The id of the heading this landmark takes its name from. */
  labelledBy?: string;
}

/**
 * The vertical rhythm of the page, in one place. DESIGN-SYSTEM ch. 4.1: 64px
 * of section padding on mobile, 96px from the desktop breakpoint.
 *
 * It exists because "consistent spacing rhythm" (PRD ch. 6.3) is a property of
 * the page, not of any one section, and a number repeated in eleven files is
 * a number that will not be eleven the same in six months. It carries the
 * `Container` too, since a section that is not `Container` wide is a hero, and
 * a hero is not a `Section`.
 */
export function Section({
  children,
  tone = "surface",
  labelledBy,
}: SectionProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`py-16 lg:py-24 ${tone === "alt" ? "bg-surface-alt" : ""}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
