import { expect, test } from "@playwright/test";

import { site } from "./servers.ts";

/**
 * The page a wrong URL lands on.
 *
 * Every destination in `content/` that is not an absolute URL points at a
 * route this application does not have, because the deliverable is the
 * homepage. Those links reach this page, and before it existed they reached
 * the framework's own default: black on white, no header, no footer, nothing
 * that read as this site.
 *
 * The populated world, arbitrarily. Nothing here owes anything to the CMS,
 * and a second build for a static page is a build nobody needed.
 */

const { url } = site("properties");

/**
 * A real 404 on the wire, not a 200 carrying an apology. Asserted from the
 * navigation's own response rather than from the markup, because this is the
 * half a crawler acts on and the half the markup cannot show.
 */
test("answers an unknown URL with a 404", async ({ page }) => {
  const response = await page.goto(`${url}/about`);

  expect(response?.status()).toBe(404);
});

/**
 * `metadata` on `not-found.tsx` is undocumented in this version of Next, and
 * it works. This is the test that will say so if an upgrade takes it away:
 * without it the 404 silently inherits the homepage's title.
 */
test("titles itself through the layout's template", async ({ page }) => {
  await page.goto(`${url}/about`);

  await expect(page).toHaveTitle("Page not found | iNi ViE Hospitality");
});

test("keeps the shell, and leads back to the homepage", async ({ page }) => {
  await page.goto(`${url}/about`);

  await expect(
    page.getByRole("heading", { level: 1, name: /could not be found/i }),
  ).toBeVisible();

  // The header and the footer arrive from the root layout, which is the whole
  // reason this is `not-found.tsx` and not `global-not-found.tsx`.
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  await page.getByRole("link", { name: "Back to the homepage" }).click();

  await expect(page).toHaveURL(`${url}/`);
});
