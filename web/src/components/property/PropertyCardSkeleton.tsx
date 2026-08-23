import { Card } from "@/components/ui/Card";

/**
 * The placeholder card of DESIGN-SYSTEM ch. 6.6. It has to match the real card
 * exactly, image ratio and clamped line counts included, or it causes the
 * layout shift it exists to prevent.
 *
 * Every dimension that does not depend on the content is matched by
 * construction rather than by measurement: the 4:3 image, the same padding,
 * the same grid, the button's own box, and a line box per placeholder line
 * that carries the type scale of the line it stands in for, so it is the
 * height of that text on both breakpoints and stays so if the scale moves. A
 * bar of some chosen height is only ever right by coincidence.
 *
 * The lines within one block sit flush against each other, because the block
 * they stand in for is a single clamped paragraph with nothing between its
 * lines but leading. A 4px gap between them would put the skeleton 12 pixels
 * below the card it holds space for, which is the whole failure in miniature.
 *
 * What cannot be matched is what the content decides. Two title lines and
 * three excerpt lines are the clamps of ch. 6.1, which are ceilings rather
 * than shapes: measured against the seed data at 1440, this card stands 28
 * pixels taller than the real one, because every seeded title happens to fit
 * on one of its two permitted lines. Reserving one line instead would only
 * move the same 28 pixels onto the first property an editor names at length.
 * The clamp is the stable rule, so the clamp is what is reserved.
 *
 * It is hidden from assistive technology: there is nothing here to read, and
 * the real content follows within a moment.
 */
export function PropertyCardSkeleton() {
  return (
    <div aria-hidden className="h-full">
      <Card>
        <div className="aspect-4/3 bg-border" />

        <div className="flex flex-1 flex-col p-5">
          {/* Two title lines and three excerpt lines: the clamps of ch. 6.1. */}
          <Line className="w-3/4 text-h3 lg:text-h3-lg" />
          <Line className="w-1/2 text-h3 lg:text-h3-lg" />

          <Line className="mt-1.5 w-2/5 text-small" />

          <Line className="mt-2.5 w-full text-body lg:text-body-lg" />
          <Line className="w-full text-body lg:text-body-lg" />
          <Line className="w-3/5 text-body lg:text-body-lg" />

          <div className="mt-auto pt-2">
            <Line className="w-1/2 text-body lg:text-body-lg" />
            {/*
              The button's own minimum height, and its own width at each
              breakpoint: full below `sm`, its label's width above it, exactly
              as PropertyCard sets it.
            */}
            <div className="mt-3.5 h-11 w-full rounded-control bg-border sm:w-34" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Line({ className }: { className: string }) {
  return (
    <span className={`block rounded-control bg-border ${className}`}>
      &nbsp;
    </span>
  );
}
