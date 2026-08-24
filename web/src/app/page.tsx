import type { Metadata } from "next";
import type { ComponentType } from "react";

import { CulinaryJourney } from "@/components/sections/CulinaryJourney";
import { Faq } from "@/components/sections/Faq";
import { FeaturedIn } from "@/components/sections/FeaturedIn";
import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { Hero } from "@/components/sections/Hero";
import { Membership } from "@/components/sections/Membership";
import { OurStory } from "@/components/sections/OurStory";
import { SpecialOffers } from "@/components/sections/SpecialOffers";
import { WelcomeBlock } from "@/components/sections/WelcomeBlock";
import { WellnessEscape } from "@/components/sections/WellnessEscape";
import { WhatsNew } from "@/components/sections/WhatsNew";
import type { SectionTone } from "@/components/ui/Section";

type Section = ComponentType<{ tone: SectionTone }>;

/**
 * The order PRD ch. 6.1 fixes, with the ground each section sits on. The hero
 * is not here: it is not a `Section`, being full bleed and running under the
 * header rather than inside the container.
 *
 * Ten of the eleven read from a typed module in `content/`. Featured
 * Properties reads the Laravel API. That is the only difference between them,
 * and it is a one line difference by design: promoting a second section to the
 * CMS means swapping an import for a fetch, not rewriting a component.
 *
 * **The ground is written here and nowhere else.** A section that chose its
 * own would have to be edited along with every section below it every time the
 * order moved, which is exactly the drift DESIGN-SYSTEM ch. 6.7 exists to
 * stop. `page.test.ts` checks that no two neighbours share one, which is the
 * property that actually matters and the one an index alone cannot express:
 * `ink` is not a step in the alternation, it is the one section that
 * interrupts it.
 */
export const SECTIONS: readonly (readonly [Section, SectionTone])[] = [
  [WelcomeBlock, "alt"],
  [FeaturedProperties, "surface"],
  [CulinaryJourney, "alt"],
  [WellnessEscape, "surface"],
  [Membership, "ink"],
  [OurStory, "surface"],
  [SpecialOffers, "alt"],
  [WhatsNew, "surface"],
  [FeaturedIn, "alt"],
  [Faq, "surface"],
];

/**
 * The canonical URL of PRD ch. 8.3, resolved against the `metadataBase` the
 * layout sets from `SITE_URL`.
 *
 * It sits on the page rather than on the layout because that is what it
 * describes. A canonical on the shell would tell a crawler that every route
 * built under it is this one.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The homepage. It composes sections in order and holds no logic of its own,
 * so each section owns its own data access and can be replaced on its own
 * (TECHNICAL-DESIGN ch. 4.1).
 */
export default function Home() {
  return (
    <>
      <Hero />
      {/* The index is the key because it is also the identity: this list is
          fixed at build time and nothing reorders it at runtime. */}
      {SECTIONS.map(([Section, tone], index) => (
        <Section key={index} tone={tone} />
      ))}
    </>
  );
}
