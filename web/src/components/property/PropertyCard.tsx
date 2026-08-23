import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PinIcon } from "@/components/ui/PinIcon";
import { PROPERTY_CARD_ACTION } from "@/content/featured-properties";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

/**
 * One property, as a card. PRD ch. 6.2 says what it must communicate,
 * DESIGN-SYSTEM ch. 6.1 says how it looks.
 *
 * Two of the eight elements are allowed to be missing, and both are handled by
 * removing them rather than by rendering a placeholder: a zero rating and a
 * price of nothing are both claims the CMS never made.
 */

/**
 * The grid is one column below 640px, two below 1024px, and three inside a
 * 1280px container above it, which puts a card at roughly 379px on a desktop.
 * Spelled out so a phone never downloads a desktop asset (RS4).
 */
const IMAGE_SIZES =
  "(min-width: 1280px) 379px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw";

/**
 * `price_from` is whole currency units and `currency` is an ISO 4217 code the
 * CMS chose, so the code is placed rather than looked up: asking Intl to
 * render the currency as a symbol would put a Rupiah sign on a column that
 * says "IDR", and would silently do something different for the next currency
 * an editor picks.
 */
const GROUPING = new Intl.NumberFormat("en-US");

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card as="article">
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          alt={property.image_alt}
          className="object-cover transition-transform group-hover:scale-104"
          fill
          sizes={IMAGE_SIZES}
          src={property.image_url}
        />
        <div className="absolute left-3 top-3">
          <Badge>
            {/* Cased for reading, not stored cased. The API's value is the
                enum, and the enum is lower case (API-SPEC ch. 3.3). */}
            <span className="capitalize">{property.category}</span>
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-heading text-h3 text-ink lg:text-h3-lg">
            {property.title}
          </h3>
          {property.rating !== null ? <Rating value={property.rating} /> : null}
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-small text-ink-muted">
          <PinIcon />
          {property.location}
        </p>

        <p className="mt-2.5 line-clamp-3 text-body text-ink-muted lg:text-body-lg">
          {property.excerpt}
        </p>

        {/*
          The equal height rule of ch. 6.1. `mt-auto` on the foot takes up
          whatever slack the clamped copy above it left, so a card with no
          price row still ends level with its neighbours instead of 50 pixels
          short of them. Nothing here fixes a height.
        */}
        <div className="mt-auto pt-2">
          {property.price_from !== null ? (
            <p className="text-body lg:text-body-lg">
              <span className="text-ink-muted">From </span>
              <span className="font-medium text-ink">
                {property.currency} {GROUPING.format(property.price_from)}
              </span>{" "}
              <span className="text-ink-muted">per night</span>
            </p>
          ) : null}

          {/*
            Full width on mobile, its own width from the tablet breakpoint
            (ch. 6.1). The column stretches its child; switching the wrapper to
            block at `sm` lets the inline-flex button shrink back again.
          */}
          <div className="mt-3.5 flex flex-col sm:block">
            <Button
              aria-label={`View ${property.title}`}
              href={property.cta_url}
            >
              {PROPERTY_CARD_ACTION}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Top right of the content area, a gold star and one decimal (ch. 6.1).
 *
 * "4.8" beside a star says nothing when it is read aloud, so the scale is
 * spelled out in text that is hidden visually rather than in an `aria-label`.
 * ARIA prohibits a label on a plain span, and a screen reader is free to
 * ignore one there and read the bare number, which is the failure this is
 * meant to fix. The star is decorative once the words carry the meaning.
 */
function Rating({ value }: { value: number }) {
  return (
    <p className="flex flex-none items-center gap-1.5 pt-1 text-small font-medium text-ink">
      <svg aria-hidden height="14" viewBox="0 0 14 14" width="14">
        <path
          className="text-gold"
          d="M7 1l1.8 3.9 4.2.5-3.1 2.9.8 4.2L7 10.4 3.3 12.5l.8-4.2L1 5.4l4.2-.5z"
          fill="currentColor"
        />
      </svg>
      {value.toFixed(1)}
      {/* The leading space is load bearing: without it the two nodes are read
          as one word, "4.8out of 5". */}
      <span className="sr-only"> out of 5</span>
    </p>
  );
}
