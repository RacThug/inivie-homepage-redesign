import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  COMPANY_LINKS,
  DEPARTMENTS,
  HEAD_OFFICE,
  LEGAL,
  SOCIAL_LINKS,
} from "@/content/footer";
import { BRAND_LOGO, BRAND_NAME } from "@/content/navigation";

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

/**
 * The hit area every link in this footer gets, rather than the line height of
 * whatever text ends up inside it.
 *
 * 44 by 44 on mobile is RS2. The 24px floor from the tablet breakpoint is
 * WCAG 2.2 SC 2.5.8, and it is here because the departments column stacks a
 * number directly on an address with nothing between them: at 18px a line
 * they were 18px apart, and both axe and Lighthouse failed the pair at 375px
 * and again at 1440px. Sizing the control is the fix; spacing the column
 * apart would have been the same 18px target with more air around it.
 *
 * `min-w-11` costs nothing visually. These are left aligned boxes, so a label
 * narrower than 44px - "Blog", "TikTok" - simply sits in a wider one.
 *
 * The display utility is left to each call site rather than baked in here.
 * A contact row has to be its own line and a social channel has to sit beside
 * the next one, so the two need `flex` and `inline-flex` respectively, and
 * Tailwind decides which of a pair of display utilities wins by the order it
 * emits them rather than by the order they are written on the element.
 */
const HIT_AREA = "min-h-11 min-w-11 items-center sm:min-h-6";

const ACTION_LINK = `${HIT_AREA} text-small text-gold underline-offset-4 hover:underline ${FOCUS_RING}`;

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
            {/*
              The mark, in the light tone the ink ground needs. ch. 6.5 calls
              this column's first element the wordmark, and the wordmark is
              the asset the header and the drawer already carry: setting the
              two words in the heading face instead left the foot of the page
              as the one place on the site the brand was spelled rather than
              shown.

              Static rather than the header's crossfading pair, because the
              ground under it never changes. The name carries the alt text,
              so the accessible content of this column is what it was when
              the name was a paragraph.
            */}
            <Image
              alt={BRAND_NAME}
              className="h-16 w-16 object-contain"
              height={BRAND_LOGO.height}
              src={BRAND_LOGO.light}
              width={BRAND_LOGO.width}
            />

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
                  className={`flex ${HIT_AREA} text-small text-surface ${FOCUS_RING}`}
                  href={`tel:${HEAD_OFFICE.phone.replace(/\s/g, "")}`}
                >
                  {HEAD_OFFICE.phone}
                </a>
              </li>
              <li>
                <a
                  className={`flex ${HIT_AREA} text-small text-surface ${FOCUS_RING}`}
                  href={`mailto:${HEAD_OFFICE.email}`}
                >
                  {HEAD_OFFICE.email}
                </a>
              </li>
              <li>
                <a className={`flex ${ACTION_LINK}`} href={HEAD_OFFICE.mapUrl}>
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
                      className={`flex ${HIT_AREA} ${SECONDARY} ${FOCUS_RING}`}
                      href={`tel:${desk.phone.replace(/\s/g, "")}`}
                    >
                      {desk.phone}
                    </a>
                  )}
                  <a
                    className={`flex ${HIT_AREA} ${SECONDARY} break-words ${FOCUS_RING}`}
                    href={`mailto:${desk.email}`}
                  >
                    {desk.email}
                  </a>
                  {desk.actions?.map((action) => (
                    <a
                      className={`mt-1 flex ${ACTION_LINK}`}
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
                    className={`inline-flex ${HIT_AREA} text-small text-surface underline-offset-4 hover:underline ${FOCUS_RING}`}
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
                    className={`inline-flex ${HIT_AREA} text-small text-surface underline-offset-4 hover:underline ${FOCUS_RING}`}
                    href={social.href}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/*
          The bottom padding is 80px rather than the 24px above it because the
          back to top control stands in this corner. It is fixed to the window,
          so at the foot of the page it is fixed to the foot of this row, and
          at 320px it sat across the end of "All Rights Reserved". The page
          reserves the 64px the control occupies instead of letting a line of
          type run underneath it.
        */}
        <div className="flex flex-col gap-3 border-t border-surface/15 pt-6 pb-20 sm:flex-row sm:items-center sm:justify-between">
          <a
            className={`inline-flex ${HIT_AREA} text-small text-surface underline-offset-4 hover:underline ${FOCUS_RING}`}
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
