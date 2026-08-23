import type { ReactNode } from "react";

import { CardGrid } from "@/components/ui/CardGrid";

interface PropertyGridProps {
  /** One `li` per card. */
  children: ReactNode;
}

/**
 * The property grid. The columns and gaps are the page's, and live in
 * `CardGrid`; what is named here is why the property section has a grid
 * component of its own at all.
 *
 * It is its own component so the loading skeleton can lay out in exactly the
 * same grid as the real cards. A skeleton in a grid of its own is how a
 * skeleton ends up causing the layout shift it was added to prevent
 * (DESIGN-SYSTEM ch. 6.6), and a name that says "property" is what keeps the
 * two of them being changed together.
 */
export function PropertyGrid({ children }: PropertyGridProps) {
  return <CardGrid>{children}</CardGrid>;
}
