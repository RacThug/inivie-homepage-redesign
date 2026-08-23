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

/**
 * The homepage. It composes sections in the order PRD ch. 6.1 fixes and holds
 * no logic of its own, so each section owns its own data access and can be
 * replaced on its own (TECHNICAL-DESIGN ch. 4.1).
 *
 * Ten of the eleven read from a typed module in `content/`. Featured
 * Properties reads the Laravel API. That is the only difference between them,
 * and it is a one line difference by design: promoting a second section to the
 * CMS means swapping an import for a fetch, not rewriting a component.
 *
 * The grounds alternate strictly, `surface` and `surface-alt` turn and turn
 * about, which is what makes eleven stacked sections read as one page. The
 * order is fixed here and nowhere else: a section that chose its own ground
 * would break the rhythm the first time one was inserted.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <WelcomeBlock />
      <FeaturedProperties />
      <CulinaryJourney />
      <WellnessEscape />
      <Membership />
      <OurStory />
      <SpecialOffers />
      <WhatsNew />
      <FeaturedIn />
      <Faq />
    </>
  );
}
