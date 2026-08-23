import { Section, type SectionTone } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ } from "@/content/faq";

/**
 * Frequently asked questions. PRD ch. 6.1 section 11.
 *
 * `details` and `summary`, so the accordion is operable by keyboard without a
 * line of JavaScript: the browser already gives it a role, an expanded state,
 * Enter and Space, and it still works before hydration and with script off.
 * A div with an `onClick` and a hand written `aria-expanded` is the same
 * component with more ways to be wrong.
 *
 * The rows are independent rather than exclusive. Closing somebody's answer
 * because they opened a second one is a behaviour nobody asked for, and it is
 * the only thing `details` would need script to do.
 *
 * Centred in a column of roughly 900px, following production. This and the
 * welcome block are the two places on the page where centring is correct: a
 * list of questions has no second column to pair with, and a left aligned
 * block would leave half the container empty (brief ch. 4.11).
 */
const HEADING_ID = "faq";

export function Faq({ tone }: { tone?: SectionTone }) {
  return (
    <Section labelledBy={HEADING_ID} tone={tone}>
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          align="center"
          eyebrow={FAQ.eyebrow}
          heading={FAQ.heading}
          headingId={HEADING_ID}
        />

        <div className="mt-8 border-t border-border lg:mt-12">
          {FAQ.entries.map((entry) => (
            <details
              className="group border-b border-border"
              key={entry.question}
            >
              {/*
                `list-none` plus the WebKit rule removes the browser's own
                triangle. The marker below replaces it, and it is `aria-hidden`
                because `details` already announces its own state.
              */}
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                <h3 className="text-body font-medium text-ink lg:text-body-lg">
                  {entry.question}
                </h3>
                <PlusIcon />
              </summary>
              <p className="max-w-measure pb-5 text-body text-ink-muted lg:text-body-lg">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** A plus that becomes a minus: the vertical stroke is what is removed when
 *  the row opens, which is a shorter journey than swapping two glyphs. */
function PlusIcon() {
  return (
    <svg
      aria-hidden
      className="flex-none text-ink-muted"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
      viewBox="0 0 16 16"
      width="16"
    >
      <path d="M2.5 8h11" />
      <path className="transition-opacity group-open:opacity-0" d="M8 2.5v11" />
    </svg>
  );
}
