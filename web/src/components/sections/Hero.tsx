import Image from "next/image";

import { SearchPanel } from "@/components/sections/SearchPanel";
import { Container } from "@/components/ui/Container";
import { HERO_IMAGE } from "@/content/hero";

/**
 * The hero: one photograph, the search panel on it, and nothing else.
 *
 * No headline sits on the image and there is no carousel, which is the whole
 * point of PRD ch. 6.1. The largest contentful paint is a single image with
 * nothing composited over it, and the words that would have gone here are in
 * the welcome block below, on a ground where the measure cap can hold.
 *
 * It runs full bleed under the fixed header, which is why `layout.tsx` gives
 * `main` no top offset. The header's resting state is transparent and reads
 * its labels off this image through its own scrim.
 */

/** The one image on the page that is not lazy. Everything else below the fold
 *  stays lazy, per TECHNICAL-DESIGN ch. 4.3. */
export function Hero() {
  return (
    <section aria-label="iNi ViE Hospitality" className="relative">
      <div className="relative h-[70vh] min-h-[30rem] w-full sm:h-[75vh] lg:h-[85vh]">
        <Image
          alt={HERO_IMAGE.alt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={HERO_IMAGE.src}
        />

        {/*
          A scrim across the lower half, not the whole frame. The search panel
          is an ink card and carries its own contrast; what this is for is the
          join between the panel and the photograph, so the panel does not
          appear to float on a bright patch of water.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/45 to-transparent"
        />
      </div>

      {/*
        The panel overlaps the foot of the image rather than sitting inside it.
        On a phone the image is 70vh of photograph and the panel is one row
        below its edge, which keeps both whole; from the tablet breakpoint it
        lifts onto the image, where production puts it.
      */}
      <div className="relative -mt-8 sm:-mt-14 lg:-mt-20">
        <Container>
          <SearchPanel />
        </Container>
      </div>
    </section>
  );
}
