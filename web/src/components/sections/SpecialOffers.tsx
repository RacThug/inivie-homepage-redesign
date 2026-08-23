import Image from "next/image";

import { Section } from "@/components/ui/Section";
import { SectionLayout } from "@/components/ui/SectionLayout";
import { OFFERS } from "@/content/offers";

/**
 * Our Special Offers. Brief ch. 4.8.
 *
 * Five items in a grid, not production's carousel. A carousel needs script on
 * the critical path, hides items from the first view, and puts a horizontal
 * drag surface against vertical page scroll on a phone, which is the same
 * argument that keeps the hero to one image.
 *
 * Five is the number the grid wants: the first tile spans two columns, so a
 * wide one plus one fills the first row and three fill the second. Four would
 * leave a hole in the bottom right corner.
 *
 * **No title is rendered.** These are production's own banners and the offer
 * name is set into the artwork. Printing it again underneath would be the
 * "title twice on one card" the brief ch. 7 rules out, so the name is the
 * link's accessible name instead. Production ships all five with
 * `alt="promo"`, which is the defect this fixes.
 */
const HEADING_ID = "offers";

export function SpecialOffers() {
  return (
    <Section labelledBy={HEADING_ID} tone="alt">
      <SectionLayout
        action={OFFERS.action}
        eyebrow={OFFERS.eyebrow}
        heading={OFFERS.heading}
        headingId={HEADING_ID}
        intro={OFFERS.intro}
      >
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {OFFERS.items.map((offer, index) => (
            <li
              className={index === 0 ? "lg:col-span-2" : undefined}
              key={offer.href}
            >
              <a
                aria-label={offer.title}
                className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                href={offer.href}
              >
                {/*
                  Square until the desktop breakpoint, where a fixed floor lets
                  the spanning tile and its neighbour end the row level. An
                  aspect ratio cannot do that job for two tiles of different
                  widths in one row.
                */}
                <div className="relative aspect-square h-full overflow-hidden rounded-card lg:aspect-auto lg:min-h-88">
                  <Image
                    alt={offer.imageAlt}
                    className="object-cover transition-transform group-hover:scale-104"
                    fill
                    sizes={
                      index === 0
                        ? "(min-width: 1280px) 810px, (min-width: 1024px) 65vw, (min-width: 640px) 50vw, 100vw"
                        : "(min-width: 1280px) 400px, (min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                    }
                    src={offer.image}
                  />
                  {/* The banners set white type over an arbitrary photograph,
                      which has no guaranteed contrast ratio. A soft even scrim
                      buys it back without flattening the picture, and it does
                      not move on hover. */}
                  <div aria-hidden className="absolute inset-0 bg-ink/20" />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </SectionLayout>
    </Section>
  );
}
