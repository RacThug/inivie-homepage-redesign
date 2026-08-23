import type { ReactNode } from "react";

interface PropertyGridProps {
  /** One `li` per card. */
  children: ReactNode;
}

/**
 * The property grid: one column on mobile, two on tablet, three on desktop
 * (DESIGN-SYSTEM ch. 7.2), with the 20px and 32px gaps of ch. 4.1.
 *
 * It is its own component so the loading skeleton can lay out in exactly the
 * same grid as the real cards. A skeleton in a grid of its own is how a
 * skeleton ends up causing the layout shift it was added to prevent.
 *
 * A list, because that is what it is: a screen reader announces how many
 * properties there are before reading the first one.
 */
export function PropertyGrid({ children }: PropertyGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {children}
    </ul>
  );
}
