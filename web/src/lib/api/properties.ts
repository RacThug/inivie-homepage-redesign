import type {
  Property,
  PropertyCategory,
  PropertyListResponse,
} from "@/types/property";

/**
 * The only module in the frontend that knows where the API lives or what it
 * answers with. API-SPEC ch. 7 makes that a rule rather than a habit: with one
 * access point, moving the CMS or versioning the endpoint touches one file.
 *
 * It is called from Server Components only, so `CMS_API_URL` stays a server
 * value and the API never has to be reachable from a browser.
 */

const ENDPOINT = "/api/v1/properties";

/** API-SPEC ch. 7. Long enough for a cold Laravel boot, short enough that a
 *  wedged CMS does not hold the homepage open. */
const TIMEOUT_MS = 5_000;

/** Matches the `max-age=60` the API itself sends (API-SPEC ch. 5.1). The tag is
 *  what the CMS drops through `app/api/revalidate/route.ts` after an edit, so
 *  the 60 seconds is the ceiling on staleness rather than the usual wait. */
const REVALIDATE_SECONDS = 60;

/** Exported because the revalidation route has to drop the same tag this read
 *  is filed under, and one of them holding its own copy of the string is how
 *  they drift apart. */
export const CACHE_TAG = "properties";

export interface PropertiesResult {
  properties: Property[];
  /**
   * Whether the list is empty because the API could not be read.
   *
   * Two different empty states reach the section and they are not the same
   * event: nothing published hides the section entirely (F4), while an
   * unreachable CMS shows a short fallback (F5). A bare array cannot tell
   * them apart, so the flag travels with the list.
   */
  unavailable: boolean;
}

const UNAVAILABLE: PropertiesResult = { properties: [], unavailable: true };

/**
 * Logged server side and swallowed. Nothing in this module throws, because a
 * throw here lands in the render tree and takes down a page that is eleven
 * twelfths static (F5).
 */
function giveUp(reason: string, cause?: unknown): PropertiesResult {
  console.error(`[api/properties] ${reason}`, cause ?? "");

  return UNAVAILABLE;
}

/**
 * The shape check is deliberately not a cast. The production defect in PRD
 * ch. 2.3 is a frontend trusting a payload the API never promised, so what
 * this module believes about the body is verified before anything downstream
 * renders it, down to each field of each property.
 *
 * Checking the envelope alone would not catch that defect. A renamed or
 * dropped field arrives as an array of objects, passes an `Array.isArray`
 * test, and reaches a card as `undefined` in the markup.
 *
 * `Record<keyof Property, ...>` is what keeps this table honest: a field added
 * to the interface and not to this table fails `tsc`, so the runtime check
 * cannot fall behind the contract it is checking. API-SPEC ch. 3.3 is the
 * authority on the list, and ch. 6 records this as the third place the
 * contract is pinned.
 */
type Check = (value: unknown) => boolean;

const isString: Check = (value) => typeof value === "string";
// No finiteness check: JSON has no NaN or Infinity to let through, and a
// branch nothing can reach is a branch nothing can test.
const isNumber: Check = (value) => typeof value === "number";

const orNull =
  (check: Check): Check =>
  (value) =>
    value === null || check(value);

const CATEGORIES: ReadonlySet<string> = new Set<PropertyCategory>([
  "resort",
  "villa",
  "hotel",
]);

const FIELDS: Record<keyof Property, Check> = {
  id: isNumber,
  title: isString,
  slug: isString,
  category: (value) => isString(value) && CATEGORIES.has(value as string),
  location: isString,
  excerpt: isString,
  image_url: isString,
  image_alt: isString,
  price_from: orNull(isNumber),
  currency: isString,
  rating: orNull(isNumber),
  cta_url: orNull(isString),
  sort_order: isNumber,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Fields the API adds later are ignored rather than refused. A key this side
 * has never heard of cannot be rendered wrongly, and refusing it would make
 * every additive change to the payload a breaking one.
 */
function isProperty(value: unknown): value is Property {
  return (
    isRecord(value) &&
    Object.entries(FIELDS).every(([field, isValid]) => isValid(value[field]))
  );
}

function isPropertyList(body: unknown): body is PropertyListResponse {
  return (
    isRecord(body) &&
    Array.isArray(body.data) &&
    body.data.every(isProperty) &&
    isRecord(body.meta) &&
    isNumber(body.meta.count)
  );
}

/**
 * Reads published properties for the homepage, ordered by the CMS.
 *
 * `limit` is passed rather than left to the endpoint's own default so the
 * number of cards is decided in one place on this side too, and so the call is
 * legible in the Laravel log a reviewer checks for A12.
 */
export async function fetchProperties(
  limit: number,
): Promise<PropertiesResult> {
  const base = process.env.CMS_API_URL;

  if (!base) {
    return giveUp("CMS_API_URL is not set, so there is no API to call");
  }

  let endpoint: URL;

  try {
    endpoint = new URL(ENDPOINT, base);
  } catch (error) {
    return giveUp(`CMS_API_URL is not a valid URL: ${base}`, error);
  }

  endpoint.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] },
    });

    if (!response.ok) {
      return giveUp(`${endpoint} answered ${response.status}`);
    }

    const body: unknown = await response.json();

    if (!isPropertyList(body)) {
      return giveUp(`${endpoint} answered a body that is not { data: [] }`);
    }

    return { properties: body.data, unavailable: false };
  } catch (error) {
    return giveUp(`${endpoint} could not be read`, error);
  }
}
