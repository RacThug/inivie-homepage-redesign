import { expect, test, type APIRequestContext } from "@playwright/test";

import { expectStaticPageIntact } from "./homepage.ts";
import { site } from "./servers.ts";
import type { Property, PropertyListResponse } from "../src/types/property.ts";

/**
 * The one section on the homepage that reads the CMS, in the three states its
 * API can leave it in.
 *
 * Each state has a frontend of its own, built against it, because the page is
 * prerendered and so the state is fixed when the site is built rather than
 * when it is requested. `servers.ts` carries that reasoning.
 *
 * The words asserted here are the visitor's, written out rather than imported
 * from `src/content/featured-properties.ts`: an expectation read from the
 * module under test cannot fail when the two change together.
 */

const HEADING = "Featured property for you";
const EYEBROW = "Stay With Us";
const ACTION = "View All Family";

const FALLBACK =
  "Our featured stays cannot be shown right now. Every property is still available on the stays page.";

/** The same formatter `PropertyCard` uses, so the assertion is the grouping a
 *  visitor reads rather than the digits the API sent. */
const GROUPING = new Intl.NumberFormat("en-US");

/**
 * What the CMS published, read from the CMS rather than restated here.
 *
 * The order, the field values and the count all come from the one place that
 * decides them, so this asserts that the page shows what the API answered
 * rather than that both happen to match a third list.
 */
async function publishedProperties(
  request: APIRequestContext,
  cmsUrl: string,
): Promise<Property[]> {
  const response = await request.get(`${cmsUrl}/api/v1/properties?limit=6`);

  expect(response.ok()).toBe(true);

  const body: PropertyListResponse = await response.json();

  expect(body.data.length).toBeGreaterThan(0);

  return body.data;
}

test.describe("with properties published", () => {
  const { cmsUrl, url } = site("properties");

  test("shows a card per property, in the order the API gave them", async ({
    page,
    request,
  }) => {
    const properties = await publishedProperties(request, cmsUrl);

    await page.goto(url);

    const section = page.getByRole("region", { name: HEADING });

    await expect(section).toBeVisible();
    await expect(section.getByText(EYEBROW)).toBeVisible();
    await expect(section.getByRole("link", { name: ACTION })).toBeVisible();

    // F2: the frontend never sorts, so the card order is the response order.
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(
      properties.map((property) => property.title),
    );
  });

  test("renders every field the CMS filled in, and omits the ones it left empty", async ({
    page,
    request,
  }) => {
    const properties = await publishedProperties(request, cmsUrl);

    await page.goto(url);

    const cards = page
      .getByRole("region", { name: HEADING })
      .getByRole("article");

    for (const [index, property] of properties.entries()) {
      const card = cards.nth(index);

      await expect(
        card.getByRole("heading", { name: property.title }),
      ).toBeVisible();
      await expect(card.getByText(property.location)).toBeVisible();
      await expect(card.getByText(property.excerpt)).toBeVisible();
      await expect(
        card.getByRole("img", { name: property.image_alt }),
      ).toBeAttached();

      /**
       * Rule D7. A price of nothing and a rating of nothing are claims the
       * CMS never made, so the card drops the row rather than printing a zero
       * into it.
       */
      if (property.price_from === null) {
        await expect(card.getByText("per night")).toHaveCount(0);
      } else {
        const price = GROUPING.format(property.price_from);

        await expect(
          card.getByText(`From ${property.currency} ${price} per night`),
        ).toBeVisible();
      }

      if (property.rating === null) {
        await expect(card.getByText("out of 5")).toHaveCount(0);
      } else {
        await expect(
          card.getByText(`${property.rating.toFixed(1)} out of 5`),
        ).toBeVisible();
      }

      /**
       * Six controls on one page read "View property", so each is named for
       * the property it leads to as well. The title is matched as part of the
       * accessible name rather than as the whole of it, because the name is
       * assembled from two nodes and the algorithm that joins them puts a
       * space between them: what a screen reader gets is "View property ,
       * Leedon Villa Seminyak".
       *
       * A null `cta_url` is the API saying there is nowhere to go, so the
       * control keeps its words and stops being a link.
       */
      if (property.cta_url === null) {
        await expect(card.getByRole("link")).toHaveCount(0);
        await expect(
          card.getByText(`View property, ${property.title}`),
        ).toBeVisible();
      } else {
        await expect(
          card.getByRole("link", { name: property.title }),
        ).toHaveAttribute("href", property.cta_url);
      }
    }
  });

  /**
   * The one thing no component test can reach: `next/image` refuses any host
   * it was not given at build time, and a refusal is a broken picture on a
   * page that otherwise passes every assertion above. So this checks that the
   * optimiser was used and that bytes came back through it.
   *
   * The first card only. The others are off the side of a centre mode track,
   * their images are lazy, and an image the browser was right not to fetch is
   * not a failure.
   */
  test("serves the card image through the optimiser", async ({ page }) => {
    await page.goto(url);

    const image = page
      .getByRole("region", { name: HEADING })
      .getByRole("article")
      .first()
      .getByRole("img");

    await expect(image).toHaveAttribute("src", /^\/_next\/image\?/);
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
  });
});

test.describe("with nothing published", () => {
  /**
   * F4. Zero published properties is a valid state rather than an error, and
   * the answer to it is that the section was never here: eyebrow, heading,
   * intro and pill leave with the cards, so the page has no empty frame in it.
   */
  test("has no Featured Properties section at all", async ({ page }) => {
    await page.goto(site("no-properties").url);

    await expect(page.getByRole("region", { name: HEADING })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: HEADING })).toHaveCount(0);
    await expect(page.getByText(EYEBROW)).toHaveCount(0);
    await expect(page.getByRole("link", { name: ACTION })).toHaveCount(0);
    await expect(page.getByText(FALLBACK)).toHaveCount(0);

    await expectStaticPageIntact(page);
  });
});

test.describe("with the CMS stopped", () => {
  /**
   * A14 and F5, and the only automated proof of either. The CMS never
   * answered, and what a visitor gets is the section with a quiet line where
   * the cards would be, on a page that is otherwise untouched.
   */
  test("keeps the section, shows the fallback, and leaves the page whole", async ({
    page,
  }) => {
    const response = await page.goto(site("stopped").url);

    expect(response?.status()).toBe(200);

    const section = page.getByRole("region", { name: HEADING });

    await expect(section).toBeVisible();
    await expect(section.getByText(FALLBACK)).toBeVisible();
    await expect(section.getByRole("article")).toHaveCount(0);

    /** The fallback carries no control of its own, because the section's own
     *  pill is already on the page and leads where the line points. */
    await expect(section.getByRole("link", { name: ACTION })).toBeVisible();

    await expectStaticPageIntact(page);
  });
});
