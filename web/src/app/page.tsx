import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Placeholder. The homepage sections are built in later issues; this exists so
 * the scaffold runs and the design system foundation is visible.
 */
export default function Home() {
  return (
    <main className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow="Foundation"
          heading="Design system in place"
          intro="Colour, type, spacing, radius, elevation, and motion tokens are defined and contrast verified. Homepage sections follow."
        />
      </Container>
    </main>
  );
}
