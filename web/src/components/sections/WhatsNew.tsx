import Image from "next/image";

import { CardGrid } from "@/components/ui/CardGrid";
import { Section } from "@/components/ui/Section";
import { SectionLayout } from "@/components/ui/SectionLayout";
import { JOURNAL } from "@/content/journal";

/**
 * What's New: the three latest articles. PRD ch. 6.1 trims production's six.
 *
 * The whole card is the link, so there is one target per article rather than a
 * title link and a "Read More" button that go to the same place. Production
 * ships both, which makes a keyboard user tab twice for one destination.
 */
const HEADING_ID = "whats-new";

/** Three columns inside a 1280px container is roughly 379px on a desktop. */
const IMAGE_SIZES =
  "(min-width: 1280px) 379px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw";

export function WhatsNew() {
  return (
    <Section labelledBy={HEADING_ID}>
      <SectionLayout
        action={JOURNAL.action}
        eyebrow={JOURNAL.eyebrow}
        heading={JOURNAL.heading}
        headingId={HEADING_ID}
        intro={JOURNAL.intro}
      >
        <CardGrid>
          {JOURNAL.articles.map((article) => (
            <li key={article.href}>
              <a
                className="group block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                href={article.href}
              >
                <article>
                  <div className="relative aspect-4/3 overflow-hidden rounded-card">
                    <Image
                      alt={article.imageAlt}
                      className="object-cover transition-transform group-hover:scale-104"
                      fill
                      sizes={IMAGE_SIZES}
                      src={article.image}
                    />
                  </div>
                  <p className="mt-4 text-eyebrow font-medium uppercase text-gold-dark">
                    {article.category}
                  </p>
                  {/* Clamped to three lines. These are long editorial titles
                      and cards in a row have to end level. */}
                  <h3 className="mt-2 line-clamp-3 font-heading text-h3 text-ink underline-offset-4 group-hover:underline lg:text-h3-lg">
                    {article.title}
                  </h3>
                </article>
              </a>
            </li>
          ))}
        </CardGrid>
      </SectionLayout>
    </Section>
  );
}
