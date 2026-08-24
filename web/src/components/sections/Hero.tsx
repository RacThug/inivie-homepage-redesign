import { SearchDock } from "@/components/search/SearchDock";
import { HeroMedia } from "@/components/sections/HeroMedia";

/**
 * The hero: production's film behind the search panel, and no type of our own.
 *
 * This page still writes no headline over the picture, which is PRD ch. 6.1's
 * actual point, and the words that would have gone here are in the welcome
 * block below on a ground where the measure cap can hold. The film itself
 * carries production's burned in copy, which is a decision recorded in
 * DESIGN-SYSTEM ch. 6.8 rather than an oversight here.
 *
 * The film costs the page nothing before it is on screen: `HeroMedia`
 * preloads the poster and does not ask for the film until the load event,
 * so nothing PRD ch. 8.2 measures is waiting on 12MB of video.
 *
 * It runs full bleed under the fixed header, which is why `layout.tsx` gives
 * `main` no top offset. The header's resting state is transparent and reads
 * its labels off this hero through its own scrim.
 */
export function Hero() {
  return (
    /*
      Film and panel are one 100vh unit, rather than a 100vh film with the
      panel hung off its bottom edge on a negative margin.

      The old arrangement put the Search button 30px below the fold on every
      desktop and tablet size once the hero grew to the full viewport, and
      Baymard's travel accommodations testing is blunt about that: a visitor
      must not have to scroll while entering search criteria. Positioning the
      panel inside the section makes that true by construction instead of by a
      margin that has to be re-tuned every time the panel's height changes.
    */
    /*
      Unnamed on purpose, so it is a plain container rather than a region.
      Naming it "iNi ViE Hospitality" gave the page two landmarks with that
      name, the other being the welcome block below, which is labelled by the
      page's `h1` reading the same words. Nothing is lost: the poster
      describes itself, the film is decorative, and the panel is already a
      `form` landmark of its own.
    */
    <section className="relative h-screen min-h-120">
      <HeroMedia />

      <SearchDock />
    </section>
  );
}
