/**
 * A stand-in for the Laravel CMS, for the end to end suite alone.
 *
 * The suite needs the API to be in a known state, and a real CMS cannot give
 * it one without a database, a migration and a seed running first. What is
 * actually under test here is the frontend's behaviour in the face of an
 * answer, so the answer is what this supplies, and `cms/tests` remains the
 * authority on whether Laravel produces it.
 *
 * It is deliberately thin. No `category` filter, no validation, no pagination:
 * the frontend sends one request with one parameter (`src/lib/api/properties.ts`),
 * and a stub that grows features nobody calls is a second implementation of
 * the API to keep in step with the first.
 *
 * The fixtures below are typed as `Property`, so the contract in
 * `src/types/property.ts` is what this file is checked against. A field added
 * to the payload and not to these rows fails `npm run typecheck`, which is the
 * same discipline `FIELDS` in `src/lib/api/properties.ts` applies at run time.
 *
 * Run as `node e2e/stub-cms.mts`, configured by `STUB_PORT` and `STUB_MODE`.
 */

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import type { Property, PropertyListResponse } from "@/types/property";

const PORT = Number(process.env.STUB_PORT);
const MODE = process.env.STUB_MODE;

if (!Number.isInteger(PORT) || PORT <= 0) {
  throw new Error(
    `STUB_PORT must be a port number, got ${process.env.STUB_PORT}`,
  );
}

if (MODE !== "properties" && MODE !== "no-properties") {
  throw new Error(
    `STUB_MODE must be "properties" or "no-properties", got ${MODE}`,
  );
}

const ORIGIN = `http://127.0.0.1:${PORT}`;

/**
 * Eight fields of the thirteen are the same shape in every row, so the two
 * rows that differ are the ones worth reading. `bisma-suites-ubud` carries no
 * price, no rating and no link, which is rule D7 and the inert control of
 * ch. 3.3 arriving together; every other row is complete.
 *
 * Six of them, because `FEATURED_PROPERTY_COUNT` is six and six is where the
 * carousel starts looping. A shorter list would leave the step controls
 * disabled and quietly stop testing them.
 */
const PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Leedon Villa Seminyak",
    slug: "leedon-villa-seminyak",
    category: "villa",
    location: "Seminyak, Bali",
    excerpt: "Private pool villa two streets back from the beach.",
    image_url: `${ORIGIN}/storage/properties/leedon-villa-seminyak.webp`,
    image_alt: "The private pool at Leedon Villa Seminyak at dusk",
    image_focus: "center",
    price_from: 3_500_000,
    currency: "IDR",
    rating: 4.8,
    cta_url: "https://inivie.com/leedon-villa-seminyak",
    sort_order: 1,
  },
  {
    id: 2,
    title: "Ajowa Resort Ubud",
    slug: "ajowa-resort-ubud",
    category: "resort",
    location: "Ubud, Bali",
    excerpt: "Terraced suites above the Petanu river valley.",
    image_url: `${ORIGIN}/storage/properties/ajowa-resort-ubud.webp`,
    image_alt: "Terraced suites at Ajowa Resort Ubud seen from the valley",
    image_focus: "top",
    price_from: 4_200_000,
    currency: "IDR",
    rating: 4.9,
    cta_url: "https://inivie.com/ajowa-resort-ubud",
    sort_order: 2,
  },
  {
    id: 3,
    title: "Arden Hotel Canggu",
    slug: "arden-hotel-canggu",
    category: "hotel",
    location: "Canggu, Bali",
    excerpt: "A short walk from Berawa beach, with a rooftop bar.",
    image_url: `${ORIGIN}/storage/properties/arden-hotel-canggu.webp`,
    image_alt: "The rooftop bar at Arden Hotel Canggu at sunset",
    image_focus: "center",
    price_from: 1_800_000,
    currency: "IDR",
    rating: 4.6,
    cta_url: "https://inivie.com/arden-hotel-canggu",
    sort_order: 3,
  },
  {
    id: 4,
    title: "Bisma Suites Ubud",
    slug: "bisma-suites-ubud",
    category: "hotel",
    location: "Ubud, Bali",
    excerpt: "Opening shortly on Jalan Bisma, rates to be announced.",
    image_url: `${ORIGIN}/storage/properties/bisma-suites-ubud.webp`,
    image_alt: "The garden courtyard at Bisma Suites Ubud",
    image_focus: "center",
    price_from: null,
    currency: "IDR",
    rating: null,
    cta_url: null,
    sort_order: 4,
  },
  {
    id: 5,
    title: "Sanora Cliff Villa",
    slug: "sanora-cliff-villa",
    category: "villa",
    location: "Uluwatu, Bali",
    excerpt: "Four bedrooms on the cliff edge, staffed and private.",
    image_url: `${ORIGIN}/storage/properties/sanora-cliff-villa.webp`,
    image_alt: "Sanora Cliff Villa on the Uluwatu cliff edge",
    image_focus: "center",
    price_from: 6_100_000,
    currency: "IDR",
    rating: 5,
    cta_url: "https://inivie.com/sanora-cliff-villa",
    sort_order: 5,
  },
  {
    id: 6,
    title: "La Mewali Beach Resort",
    slug: "la-mewali-beach-resort",
    category: "resort",
    location: "Sanur, Bali",
    excerpt: "Family rooms opening onto the sand on the quiet east coast.",
    image_url: `${ORIGIN}/storage/properties/la-mewali-beach-resort.webp`,
    image_alt: "Family rooms opening onto the sand at La Mewali Beach Resort",
    image_focus: "center",
    price_from: 2_750_000,
    currency: "IDR",
    rating: 4.7,
    cta_url: "https://inivie.com/la-mewali-beach-resort",
    sort_order: 6,
  },
];

const PUBLISHED = MODE === "properties" ? PROPERTIES : [];

/**
 * One picture, served for every property. The suite asserts that the bytes
 * arrive and that `next/image` optimised them, not which photograph they are,
 * and six near-identical files committed for a test double would be six files
 * to keep. It is a real image from `public/` rather than a generated pixel so
 * that a failure screenshot shows a card rather than a smear.
 */
const IMAGE = await readFile(
  new URL("../public/home/story/1.webp", import.meta.url),
);

interface JsonResponse {
  body: string;
  status: number;
}

function json(body: unknown, status = 200): JsonResponse {
  return { body: JSON.stringify(body), status };
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", ORIGIN);

  if (url.pathname.startsWith("/storage/properties/")) {
    response.writeHead(200, {
      "content-type": "image/webp",
      "content-length": IMAGE.byteLength,
      "cache-control": "public, max-age=60",
    });
    response.end(IMAGE);
    return;
  }

  const { body, status } = route(url);

  response.writeHead(status, {
    "content-type": "application/json",
    // Mirrors what the real endpoint sends (API-SPEC ch. 5.1).
    "cache-control": "public, max-age=60",
  });
  response.end(body);
});

function route(url: URL): JsonResponse {
  if (url.pathname === "/api/v1/health") {
    return json({ status: "ok" });
  }

  if (url.pathname === "/api/v1/properties") {
    const limit = Number(url.searchParams.get("limit") ?? PUBLISHED.length);
    const data = PUBLISHED.slice(0, limit);

    // Already ordered by `sort_order`, because the real endpoint orders server
    // side and the frontend never sorts (API-SPEC ch. 3.4). The suite reads
    // the order off this response and expects the page to match it.
    const payload: PropertyListResponse = {
      data,
      meta: { count: data.length },
    };

    return json(payload);
  }

  return json({ message: "Not Found." }, 404);
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[stub-cms] ${MODE} on ${ORIGIN}`);
});
