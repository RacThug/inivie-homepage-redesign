import type { ReactNode } from "react";

interface CardGridProps {
  /** One `li` per card. */
  children: ReactNode;
}

/**
 * The card grid the page uses wherever cards sit in a row: one column on
 * mobile, two on tablet, three on desktop, with the 20px and 32px gaps of
 * DESIGN-SYSTEM ch. 4.1 and ch. 7.2.
 *
 * Properties, restaurants, spas and articles all land in it, which is why the
 * rule lives here rather than in four files that agree today.
 *
 * A list, because that is what it is: a screen reader announces how many
 * cards there are before reading the first one.
 */
export function CardGrid({ children }: CardGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {children}
    </ul>
  );
}
