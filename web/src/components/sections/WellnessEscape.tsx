import { VenueSection } from "@/components/sections/VenueSection";
import type { SectionTone } from "@/components/ui/Section";
import { WELLNESS } from "@/content/venues";

/** Wellness Harmony Escape. See `CulinaryJourney` for why this is two lines. */
export function WellnessEscape({ tone }: { tone?: SectionTone }) {
  return <VenueSection content={WELLNESS} headingId="wellness" tone={tone} />;
}
