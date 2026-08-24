import { expect, test, type Page } from "@playwright/test";

import { site } from "./servers.ts";

/**
 * Getting back to the top of a page that is 16.6 viewports tall at 375px.
 *
 * Both controls are asserted here because they are one behaviour with two
 * entrances, and the second one is the reason the first exists: the wordmark
 * is a link to the route the visitor is already on, Next answers that by doing
 * nothing, and the only thing on screen that read as a way home was inert.
 *
 * The populated world, arbitrarily. Neither control owes anything to the CMS,
 * and a fourth build for a header and a button is a build nobody needed.
 */

const CONTROL = { name: "Back to top" };
/** Exact, because "About iNi ViE" and an offer card both carry the brand
 *  in their own accessible names. */
const WORDMARK = { exact: true, name: "iNi ViE" };

function scrollY(page: Page) {
  return page.evaluate(() => window.scrollY);
}

async function scrollToFoot(page: Page) {
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto(site("properties").url);
});

test("stays out of the hero, then takes the visitor back to it", async ({
  page,
}) => {
  const control = page.getByRole("button", CONTROL);

  // Nothing over the hero: the first viewport is the one screen a visitor has
  // no reason to be returned from.
  await expect(control).toHaveCount(0);

  await scrollToFoot(page);
  await expect(control).toBeVisible();

  await control.click();

  // Polled rather than read once, because the scroll is smooth and the click
  // returns before it lands.
  await expect.poll(() => scrollY(page)).toBe(0);
  await expect(control).toHaveCount(0);

  /**
   * The control removes itself on arrival, and focus has to be somewhere real
   * before it goes. Left on a button that no longer exists it falls to `body`,
   * and the next Tab starts from the beginning of the document rather than
   * from the top of the page the visitor just returned to.
   */
  await expect(page.getByRole("link", WORDMARK)).toBeFocused();
});

test("gives the wordmark the same job, on the page it points at", async ({
  page,
}) => {
  await scrollToFoot(page);
  expect(await scrollY(page)).toBeGreaterThan(0);

  await page.getByRole("link", WORDMARK).click();

  await expect.poll(() => scrollY(page)).toBe(0);
});

/**
 * 320px is not one of the three widths RS1 fixes, and nothing else in this
 * suite runs there. It is here because the collision this guards against was
 * found there and only there: the control is fixed to the window, so at the
 * foot of the page it stands in the footer's last row, and at 320 it sat
 * across the end of "All Rights Reserved". The page reserves that corner.
 */
test.describe("at the narrowest width a phone reports", () => {
  test.use({ viewport: { height: 700, width: 320 } });

  test("stands clear of the last line of the footer", async ({ page }) => {
    await scrollToFoot(page);

    const control = await page.getByRole("button", CONTROL).boundingBox();
    const legal = await page.getByText(/All Rights Reserved/).boundingBox();

    expect(control).not.toBeNull();
    expect(legal).not.toBeNull();
    expect(legal!.y + legal!.height).toBeLessThanOrEqual(control!.y);
  });
});
