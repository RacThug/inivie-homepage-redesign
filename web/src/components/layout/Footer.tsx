import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  COMPANY_LINKS,
  DEPARTMENTS,
  HEAD_OFFICE,
  LEGAL,
  SOCIAL_LINKS,
} from "@/content/footer";
import { BRAND_NAME } from "@/content/navigation";

/**
 * Column heading treatment. Gold reaches 6.87 to 1 on ink, so this is the one
 * surface on the site where gold is allowed to carry text (DESIGN-SYSTEM
 * ch. 2.2).
 */
const COLUMN_HEADING = "text-eyebrow font-medium uppercase text-gold";

/**
 * Secondary text on the ink ground, using the token added for it in
 * DESIGN-SYSTEM ch. 2.1. `ink-muted` is built for light surfaces and
 * disappears here. The ratio is asserted in `design/palette.test.ts` rather
 * than recorded in a comment that cannot fail.
 */
const SECONDARY = "text-small text-on-ink-muted";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

const ACTION_LINK = `text-small text-gold underline-offset-4 hover:underline ${FOCUS_RING}`;

/**
 * Four columns on desktop, two on tablet, one on mobile (RS from
 * DESIGN-SYSTEM ch. 7.2).
 *
 * The five department desks are kept whole rather than collapsed into one
 * "contact us". Production splits them because a job applicant and a travel
 * agent genuinely need different people, and flattening that would be a
 * redesign of the business rather than of the page.
 */
export function Footer() {
  return (
    <footer className="bg-ink text-surface">
      <Container>
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-24">
          <section>
            <p className="font-heading text-h3">{BRAND_NAME}</p>

            <h2 className={`${COLUMN_HEADING} mt-8`}>Head Office</h2>
            <address className={`${SECONDARY} mt-3 not-italic`}>
              {HEAD_OFFICE.lines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </address>

            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a
                  className={`text-small text-surface ${FOCUS_RING}`}
                  href={`tel:${HEAD_OFFICE.phone.replace(/\s/g, "")}`}
                >
                  {HEAD_OFFICE.phone}
                </a>
              </li>
              <li>
                <a
                  className={`text-small text-surface ${FOCUS_RING}`}
                  href={`mailto:${HEAD_OFFICE.email}`}
                >
                  {HEAD_OFFICE.email}
                </a>
              </li>
              <li>
                <a className={ACTION_LINK} href={HEAD_OFFICE.mapUrl}>
                  View on map
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className={COLUMN_HEADING}>Departments</h2>
            <ul className="mt-4 flex flex-col gap-5">
              {DEPARTMENTS.map((desk) => (
                <li key={desk.email}>
                  <p className="text-small font-medium text-surface">
                    {desk.name}
                  </p>
                  {desk.phone && (
                    <a
                      className={`${SECONDARY} block ${FOCUS_RING}`}
                      href={`tel:${desk.phone.replace(/\s/g, "")}`}
                    >
                      {desk.phone}
                    </a>
                  )}
                  <a
                    className={`${SECONDARY} block break-words ${FOCUS_RING}`}
                    href={`mailto:${desk.email}`}
                  >
                    {desk.email}
                  </a>
                  {desk.actions?.map((action) => (
                    <a
                      className={`${ACTION_LINK} mt-1 block`}
                      href={action.href}
                      key={action.href}
                    >
                      {action.label}
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={COLUMN_HEADING}>Company</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    className={`inline-flex min-h-11 items-center text-small text-surface underline-offset-4 hover:underline sm:min-h-0 ${FOCUS_RING}`}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={COLUMN_HEADING}>Subscribe</h2>
            <p className={`${SECONDARY} mt-3`}>
              Receive latest offers and promos without spam
            </p>

            {/*
              Wired to nothing on purpose. There is no newsletter endpoint in
              scope, and a form that silently discards an address is worse than
              one that has not been connected yet.
            */}
            {/*
              Stacked at every width. Side by side, the field and the button
              share a column roughly 290px wide at 1440, and the button is the
              one that gives: it shrinks to its 44px minimum and the label
              spills out of the fill.
            */}
            <form className="mt-4 flex flex-col gap-3" method="post">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                autoComplete="email"
                className={`min-h-11 rounded-control border border-surface/25 bg-surface/10 px-4 text-small text-surface placeholder:text-surface/60 ${FOCUS_RING}`}
                id="newsletter-email"
                name="email"
                placeholder="Email address"
                required
                type="email"
              />
              <Button fullWidth type="submit">
                Subscribe
              </Button>
            </form>

            <h2 className={`${COLUMN_HEADING} mt-8`}>
              Follow our social media
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.href}>
                  <a
                    className={`inline-flex min-h-11 items-center text-small text-surface underline-offset-4 hover:underline sm:min-h-0 ${FOCUS_RING}`}
                    href={social.href}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-surface/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            className={`inline-flex min-h-11 items-center text-small text-surface underline-offset-4 hover:underline sm:min-h-0 ${FOCUS_RING}`}
            href={LEGAL.policy.href}
          >
            {LEGAL.policy.label}
          </a>
          <p className={SECONDARY}>{LEGAL.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
