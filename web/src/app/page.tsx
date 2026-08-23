import { FeaturedProperties } from "@/components/sections/FeaturedProperties";
import { Container } from "@/components/ui/Container";

/**
 * The homepage. It composes sections in order and holds no logic of its own,
 * so each section owns its own data access and can be replaced on its own
 * (TECHNICAL-DESIGN ch. 4.1).
 *
 * Only Featured Properties is here so far. The remaining eleven sections are
 * static content and are built in #15.
 *
 * The band below stands in for the hero. It is here because the header's
 * resting state is transparent and needs something dark to sit on: over a
 * white page the scrim reads as a smudge rather than as a legibility aid.
 * #15 replaces it with the real hero, which is a full bleed image carrying
 * the search panel (PRD ch. 6.1), and the band goes with it.
 */
export default function Home() {
  return (
    <>
      <div className="flex h-[70vh] items-end bg-ink lg:h-[85vh]">
        <Container>
          <p className="pb-16 text-eyebrow font-medium uppercase text-gold">
            Hero, built in #15
          </p>
        </Container>
      </div>

      <FeaturedProperties />
    </>
  );
}
