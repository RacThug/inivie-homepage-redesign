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
/**
 * What one cell of this grid is worth at each breakpoint. Three columns inside
 * a 1280px container puts a card at roughly 379px on a desktop.
 *
 * It lives here because the columns above are what produce it: a `sizes` that
 * disagrees with the grid it describes is how a phone ends up downloading a
 * desktop asset, which is requirement RS4.
 */
export const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 379px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw";

export function CardGrid({ children }: CardGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {children}
    </ul>
  );
}
