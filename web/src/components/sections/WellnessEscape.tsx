import { VenueSection } from "@/components/sections/VenueSection";
import { WELLNESS } from "@/content/venues";

/** Wellness Harmony Escape. See `CulinaryJourney` for why this is two lines. */
export function WellnessEscape() {
  return <VenueSection content={WELLNESS} headingId="wellness" />;
}
