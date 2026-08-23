import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Placeholder. The homepage sections are built in #14 and #15.
 *
 * The band below stands in for the hero. It is here because the header's
 * resting state is transparent and needs something dark to sit on: over a
 * white page the scrim reads as a smudge rather than as a legibility aid.
 * #15 replaces it with the real hero, which is a full bleed image carrying the
 * search panel (PRD ch. 6.1), and the band goes with it.
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

      <div className="py-16 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Foundation"
            heading="Design system in place"
            intro="Colour, type, spacing, radius, elevation, and motion tokens are defined and contrast verified. Homepage sections follow."
          />
        </Container>
      </div>
    </>
  );
}
