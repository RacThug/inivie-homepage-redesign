import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

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
 * The tags this route is willing to drop. One today, because one section
 * reads the API, and an allowlist rather than a pass-through so a caller
 * cannot invalidate the whole site by naming a tag nobody meant to expose.
 */
const KNOWN_TAGS: ReadonlySet<string> = new Set(["properties"]);

/**
 * Next 16 requires an expiration profile alongside the tag, and this is the
 * only one that means what ch. 5.2 says: the cached homepage is expired
 * outright, so the next visitor gets the edit.
 *
 * A named profile such as `"max"` would mark the entry stale and go on
 * serving it while regenerating behind the request, which is the opposite of
 * the point - the 60 second time to live already covers eventual
 * consistency. `updateTag`, the other immediate option, throws outside a
 * Server Action.
 */
const IMMEDIATELY = { expire: 0 };

interface Outcome {
  status: number;
  body: Record<string, unknown>;
}

const ACCEPTED = (tag: string): Outcome => ({
  status: 200,
  body: { revalidated: true, tag },
});

const UNAUTHORISED: Outcome = {
  status: 401,
  body: { revalidated: false, message: "Invalid revalidation secret." },
};

const UNKNOWN_TAG: Outcome = {
  status: 400,
  body: { revalidated: false, message: "Unknown tag." },
};

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

    return answer(UNAUTHORISED);
  }

  const offered = request.headers.get(SECRET_HEADER);

  if (offered === null || !matches(offered, expected)) {
    return answer(UNAUTHORISED);
  }

  const tag = await readTag(request);

  if (tag === null || !KNOWN_TAGS.has(tag)) {
    return answer(UNKNOWN_TAG);
  }

  revalidateTag(tag, IMMEDIATELY);

  return answer(ACCEPTED(tag));
}

function answer({ status, body }: Outcome): Response {
  return Response.json(body, { status });
}
