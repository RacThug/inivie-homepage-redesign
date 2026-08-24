import { expect, test } from "@playwright/test";

import { site } from "./servers.ts";

/**
 * The navigation below 1024px, per RS3.
 *
 * 375px is the narrowest of the three widths the project is checked at, and
 * the one the drawer exists for. The site it runs against is the populated
 * one, arbitrarily: the header owes nothing to the CMS, and building a fourth
 * world for it would be a build nobody needed.
 *
 * This is also the only test in the suite that proves the page hydrates. The
 * drawer is one of the four client components on the homepage, and a bundle
 * that failed to load leaves a toggle that does nothing while every other
 * assertion in this suite still passes.
 */

test.use({ viewport: { height: 812, width: 375 } });

const TOGGLE = { name: "Open menu" };
const DRAWER = { name: "Site menu" };
const CLOSE = { name: "Close menu" };

test.beforeEach(async ({ page }) => {
  await page.goto(site("properties").url);
});

test("opens the drawer and closes it from the panel", async ({ page }) => {
  const toggle = page.getByRole("button", TOGGLE);
  const drawer = page.getByRole("dialog", DRAWER);

  await expect(toggle).toBeVisible();
  await expect(drawer).toHaveCount(0);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();

  await expect(drawer).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  /** RS3: focus is moved into the panel rather than left behind it, so the
   *  next Tab is inside the menu that just opened. */
  await expect(drawer.getByRole("button", CLOSE)).toBeFocused();

  await drawer.getByRole("button", CLOSE).click();

  await expect(drawer).toHaveCount(0);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("closes the drawer on Escape and gives the toggle its focus back", async ({
  page,
}) => {
  const toggle = page.getByRole("button", TOGGLE);
  const drawer = page.getByRole("dialog", DRAWER);

  await toggle.click();
  await expect(drawer).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(drawer).toHaveCount(0);
  await expect(toggle).toBeFocused();
});
