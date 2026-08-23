import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { WELCOME } from "@/content/hero";

/**
 * The welcome block, on a light ground below the hero. PRD ch. 6.1 section 2b.
 *
 * This carries the page's one H1. Splitting it off the photograph solves three
 * things at once: a 350 character paragraph is unreadable over an image but
 * fine here, the hero stays a single image with no text to composite, and the
 * 65 character measure cap of DESIGN-SYSTEM ch. 3.3 can actually be honoured,
 * because a centred column can be constrained without fighting a picture
 * behind it.
 *
 * Centred, which the brief ch. 7 otherwise warns against. It is right here for
 * the same reason it is right on the FAQ: there is no second column to pair
 * with, and a left aligned block would leave the right half of a 1280px
 * container empty.
 */
const HEADING_ID = "welcome";

export function WelcomeBlock() {
  return (
    <Section labelledBy={HEADING_ID} tone="alt">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          className="font-heading text-h1 text-ink lg:text-h1-lg"
          id={HEADING_ID}
        >
          {WELCOME.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-measure text-body text-ink-muted lg:mt-6 lg:text-body-lg">
          {WELCOME.body}
        </p>
        <div className="mt-8">
          <Button href={WELCOME.action.href}>{WELCOME.action.label}</Button>
        </div>
      </div>
    </Section>
  );
}
