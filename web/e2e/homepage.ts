import { expect, type Page } from "@playwright/test";

/**
 * The headings of the nine sections that owe nothing to the CMS, in the order
 * PRD ch. 6.1 fixes them in, starting with the page's one H1.
 *
 * They are written out rather than imported from `src/content/`. A test that
 * reads its expectation from the module under test cannot fail when the two
 * change together, and "the homepage still says these words" is exactly the
 * kind of change that should be made on purpose and seen in a diff.
 */
export const STATIC_HEADINGS = [
  "iNi ViE Hospitality",
  "The Culinary Journey",
  "Wellness Harmony Escape",
  "Join WeInivie Membership",
  "Our Story",
  "Our Special Offers",
  "What's New",
  "Featured In",
  "Frequently asked questions",
] as const;

/**
 * What requirement F5 means by "the rest of the page still renders".
 *
 * Eleven twelfths of the homepage has nothing to do with Laravel, and the
 * whole point of the degradation rules is that the twelfth cannot take them
 * with it. So the two tests that stop the CMS answering assert the other nine
 * sections and the footer are all still there, rather than only that the page
 * returned a 200.
 */
export async function expectStaticPageIntact(page: Page): Promise<void> {
  for (const heading of STATIC_HEADINGS) {
    await expect(
      page.getByRole("heading", { exact: true, name: heading }),
    ).toBeVisible();
  }

  await expect(page.getByRole("contentinfo")).toBeVisible();
}
