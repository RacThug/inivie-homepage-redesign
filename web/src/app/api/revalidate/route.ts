import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { CACHE_TAG } from "@/lib/api/properties";

/**
 * The cache invalidation callback of API-SPEC ch. 5.2, called by the Laravel
 * CMS after a create, update, delete, reorder, or publish toggle.
 *
 * This is the only write surface the frontend has, which is why the secret is
 * checked before the body is even read: an unauthenticated caller learns
 * nothing about which tags exist, and no work is done on its behalf.
 */

const SECRET_HEADER = "x-revalidate-secret";

/**
 * The tags this route is willing to drop, taken from the module that files
 * the reads under them. One today, because one section reads the API, and an
 * allowlist rather than a pass-through so a caller cannot invalidate the
 * whole site by naming a tag nobody meant to expose.
 */
const KNOWN_TAGS: ReadonlySet<string> = new Set([CACHE_TAG]);

/**
 * Next 16 requires an expiration profile alongside the tag, and this is the
 * only one that means what ch. 5.2 says: the cached homepage is expired
 * outright, so the next visitor gets the edit.
 *
 * Next's own reference recommends `"max"`, and that recommendation is for a
 * different requirement: it marks the entry stale and goes on serving it
 * while regenerating behind the request. That is what the 60 second time to
 * live already does for free, so taking it here would leave this route with
 * nothing to add. `updateTag`, the other immediate option, throws outside a
 * Server Action. Verified against
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`.
 */
const IMMEDIATE_EXPIRY = { expire: 0 };

/** The two refusals of ch. 5.2. Everything this route declines to do says so
 *  in the same shape as everything it does. */
function refuse(status: 400 | 401, message: string): Response {
  return Response.json({ revalidated: false, message }, { status });
}

/**
 * Compared as digests rather than with `===`, so the time the comparison
 * takes carries no information about how much of the secret was right.
 * Hashing first is what lets a wrong length go through the same constant
 * time path as a wrong byte: `timingSafeEqual` throws on mismatched lengths,
 * and a throw is itself the answer an attacker wanted.
 */
function matches(offered: string, expected: string): boolean {
  return timingSafeEqual(digest(offered), digest(expected));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * The tag the caller asked for, or null for a body this route cannot read.
 * A malformed body and an unrecognised tag are the same 400: in both cases
 * there is no tag to drop.
 */
async function readTag(request: Request): Promise<string | null> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || !("tag" in body)) {
      return null;
    }

    return typeof body.tag === "string" ? body.tag : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const expected = process.env.REVALIDATE_SECRET;

  // Fails closed. An unset secret is a misconfiguration, and the safe
  // reading of it is that nothing can be authenticated rather than that
  // everything can: the alternative leaves an open cache-busting endpoint on
  // a deployment whose environment was filled in incompletely.
  if (!expected) {
    console.error(
      "[api/revalidate] REVALIDATE_SECRET is not set, so no caller can be authenticated",
    );

    return refuse(401, "Invalid revalidation secret.");
  }

  const offered = request.headers.get(SECRET_HEADER);

  if (offered === null || !matches(offered, expected)) {
    return refuse(401, "Invalid revalidation secret.");
  }

  const tag = await readTag(request);

  if (tag === null || !KNOWN_TAGS.has(tag)) {
    return refuse(400, "Unknown tag.");
  }

  revalidateTag(tag, IMMEDIATE_EXPIRY);

  return Response.json({ revalidated: true, tag });
}
