import { VenueSection } from "@/components/sections/VenueSection";
import type { SectionTone } from "@/components/ui/Section";
import { CULINARY } from "@/content/venues";

/**
 * The Culinary Journey. It owns its own data access and nothing else, which is
 * what TECHNICAL-DESIGN ch. 4.1 asks a section component for: `page.tsx`
 * composes sections and holds no logic, so the import lives here.
 */
export function CulinaryJourney({ tone }: { tone?: SectionTone }) {
  return <VenueSection content={CULINARY} headingId="culinary" tone={tone} />;
}
