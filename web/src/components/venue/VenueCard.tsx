import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { PinIcon } from "@/components/ui/PinIcon";
import type { Venue } from "@/content/venues";

interface VenueCardProps {
  venue: Venue;
}

/**
 * A restaurant or a spa, as a card. The brief ch. 4.4 asks for something
 * visually lighter than the property card, and the weight comes off in the
 * right place: the card chrome goes, not the information.
 *
 * There is no border, no elevation and no button, because there is nothing to
 * press. These venues are not bookable objects on this page, so the section's
 * own control is the one way out of it, which is what PRD ch. 6.3 asks for.
 * A card that looks pressable and is not is worse than a card that does not.
 *
 * Nothing here moves on hover either. The property card scales its image
 * because the whole card is a link and the motion says so; repeating it on
 * something inert would be decoration, and ch. 5 lists what motion is for.
 */

/**
 * Three columns inside a 1280px container puts a card at roughly 379px on a
 * desktop. Spelled out so a phone never downloads a desktop asset (RS4).
 */
const IMAGE_SIZES =
  "(min-width: 1280px) 379px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw";

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <article className="h-full">
      <div className="relative aspect-4/3 overflow-hidden rounded-card">
        <Image
          alt={venue.imageAlt}
          className="object-cover"
          fill
          sizes={IMAGE_SIZES}
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
    </article>
  );
}
