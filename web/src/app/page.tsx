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

/**
 * The order PRD ch. 6.1 fixes, minus the hero, which is not a `Section`: it is
 * full bleed and runs under the header rather than inside the container.
 *
 * Ten of the eleven read from a typed module in `content/`. Featured
 * Properties reads the Laravel API. That is the only difference between them,
 * and it is a one line difference by design: promoting a second section to the
 * CMS means swapping an import for a fetch, not rewriting a component.
 */
const SECTIONS: readonly ComponentType<{ tone: SectionTone }>[] = [
  WelcomeBlock,
  FeaturedProperties,
  CulinaryJourney,
  WellnessEscape,
  Membership,
  OurStory,
  SpecialOffers,
  WhatsNew,
  FeaturedIn,
  Faq,
];

/**
 * The grounds alternate, `surface-alt` and `surface` turn and turn about,
 * which is what makes ten stacked sections read as one page rather than ten
 * (DESIGN-SYSTEM ch. 6.7).
 *
 * Derived from position rather than written on each section, so inserting or
 * reordering one cannot leave two neighbours on the same ground. A section
 * that chose its own would have to be edited along with every section below it
 * every time the order moved, which is exactly the drift the rule exists to
 * stop.
 */
function groundFor(index: number): SectionTone {
  return index % 2 === 0 ? "alt" : "surface";
}

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
          fixed at build time and nothing reorders it at runtime. A component's
          `name` would have done, until a minifier renamed it. */}
      {SECTIONS.map((Section, index) => (
        <Section key={index} tone={groundFor(index)} />
      ))}
    </>
  );
}
