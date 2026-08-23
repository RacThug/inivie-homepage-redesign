import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Lets a card carry the right semantics for where it sits. */
  as?: "div" | "article";
}

/**
 * The shared card surface. DESIGN-SYSTEM ch. 6.1.
 *
 * It fills its grid cell and lays its content out as a column, which is how
 * the equal height rule is met: a footer action can be pushed to the bottom
 * with `mt-auto` without anyone fixing a height and clipping a long title.
 *
 * It is also the hover `group`. ch. 6.1 scales a property card's image when
 * the card is hovered rather than the image, so the card is what the group
 * has to be: a group declared further in would only ever see part of it.
 */
export function Card({ children, as: Element = "div" }: CardProps) {
  return (
    <Element className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-rest transition-shadow hover:shadow-raised">
      {children}
    </Element>
  );
}
