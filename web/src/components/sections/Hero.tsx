import { HeroMedia } from "@/components/sections/HeroMedia";
import { SearchPanel } from "@/components/sections/SearchPanel";
import { Container } from "@/components/ui/Container";

/**
 * The hero: production's film behind the search panel, and no type of our own.
 *
 * This page still writes no headline over the picture, which is PRD ch. 6.1's
 * actual point, and the words that would have gone here are in the welcome
 * block below on a ground where the measure cap can hold. The film itself
 * carries production's burned in copy, which is a decision recorded in
 * DESIGN-SYSTEM ch. 6.8 rather than an oversight here.
 *
 * The largest contentful paint is unchanged: `HeroMedia` paints the poster
 * with `priority` and mounts the film afterwards, so the number that PRD
 * ch. 8.2 sets a floor under is still a 143KB still.
 *
 * It runs full bleed under the fixed header, which is why `layout.tsx` gives
 * `main` no top offset. The header's resting state is transparent and reads
 * its labels off this hero through its own scrim.
 */
export function Hero() {
  return (
    <section aria-label="iNi ViE Hospitality" className="relative">
      {/*
        Full viewport at every breakpoint, which is production's. The 480px
        floor stays underneath it for a short landscape window, where 100vh is
        a strip rather than a hero.

        `vh` rather than `dvh`: `dvh` follows a mobile browser's chrome as it
        hides and shows, so the hero would resize under the visitor mid scroll
        and take the layout shift score with it.
      */}
      <div className="relative h-screen min-h-120 w-full">
        <HeroMedia />
      </div>

      {/*
        The panel overlaps the foot of the image rather than sitting inside it.
        On a phone the film fills the viewport and the panel is one row below
        its edge, which keeps both whole; from the tablet breakpoint it lifts
        onto the film.
      */}
      <div className="relative -mt-8 sm:-mt-14 lg:-mt-20">
        <Container>
          <SearchPanel />
        </Container>
      </div>
    </section>
  );
}
