import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * The page for a URL this application does not answer.
 *
 * `app/not-found.tsx` catches every unmatched route rather than only a
 * `notFound()` thrown inside a segment, and it renders inside the root
 * layout, so the header and the footer arrive with it and a wrong URL still
 * reads as this site instead of as the framework's default black on white.
 *
 * `global-not-found` would bypass the layout, which is why it is not used
 * here: it exists for an app with several root layouts or a dynamic segment
 * at the top, and this one has a single shell that is worth keeping.
 *
 * The `metadata` below is exported on the strength of a measurement rather
 * than of the documentation: `not-found.md` in this version describes the
 * export on `global-not-found` and says nothing about this file. It is read
 * all the same, and the built page comes back titled through the layout's
 * template. Without it the 404 carried the homepage's own title.
 *
 * The `noindex` a 404 needs is not set here. The framework injects it on the
 * status code, which was verified on the same run.
 */
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    /*
     * Its own top spacing, because the layout adds none: the header is fixed
     * and the homepage hero is full bleed and runs underneath it, so a page
     * without a hero has to clear the header itself. `pt` here is that
     * clearance plus the section rhythm, not the rhythm alone.
     */
    <div className="pb-24 pt-40 lg:pb-32 lg:pt-48">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="404"
          heading="This page could not be found"
          intro="The link may be out of date, or the page may have moved."
          level={1}
        />

        <div className="mt-8 flex justify-center lg:mt-10">
          <Button href="/">Back to the homepage</Button>
        </div>
      </Container>
    </div>
  );
}
