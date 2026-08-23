import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { CAROUSEL_IMAGE_SIZES } from "@/components/ui/carouselTrack";
import { PinIcon } from "@/components/ui/PinIcon";
import type { Venue } from "@/content/venues";

interface VenueCardProps {
  venue: Venue;
}

/**
 * A restaurant or a spa, as a card. The brief ch. 4.4 asks for something
 * visually lighter than the property card, and the weight comes off in the
 * right place: the card chrome goes, not the information. No border, no
 * elevation, no button.
 *
 * What it does have is a destination. The whole card is one link to the
 * venue's own page on the sub-brand site that runs it, which is what
 * production does too. An earlier version of this card was inert, and that
 * was defensible while the section held three venues and no way to move
 * through them; with six on a track it is not. A visitor who has just been
 * shown six restaurants wants one of them.
 *
 * The link wraps everything rather than sitting on the name, so the target is
 * the card a visitor is already pointing at rather than two words inside it.
 * One link per card, so the six of them are announced as six destinations and
 * not as twelve.
 *
 * The image scales on hover for the same reason the property card's does: the
 * card leads somewhere and the motion says so. That was the exact argument for
 * leaving it out before, and it changed side when the destination arrived.
 */
export function VenueCard({ venue }: VenueCardProps) {
  return (
    <article className="h-full">
      <a
        className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        href={venue.url}
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-card">
          <Image
            alt={venue.imageAlt}
            className="object-cover transition-transform group-hover:scale-104"
            fill
            sizes={CAROUSEL_IMAGE_SIZES}
            src={venue.image}
          />
          <div className="absolute left-3 top-3">
            <Badge>{venue.category}</Badge>
          </div>
        </div>

        <h3 className="mt-4 font-heading text-h3 text-ink lg:text-h3-lg">
          {venue.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-small text-ink-muted">
          <PinIcon />
          {venue.location}
        </p>
      </a>
    </article>
  );
}
