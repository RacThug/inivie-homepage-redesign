/**
 * The addresses the end to end suite runs against, in one table.
 *
 * Three frontends rather than one, because the homepage is prerendered
 * (TECHNICAL-DESIGN ch. 3.4): what a visitor is served was decided when the
 * site was built, not when the page was requested. One build therefore cannot
 * show three different CMS states. Driving a single build through them with
 * `revalidateTag` would work, and would test the regeneration path rather than
 * the built HTML that F4 and F5 are actually met in, which is the opposite of
 * what this suite is for.
 *
 * So each state gets its own build, its own `distDir` and its own server. The
 * three share nothing, which is also what lets the specs run in parallel and
 * what keeps one test from deciding what the next one sees.
 *
 * The ports sit in a band of their own. 3000 belongs to `next dev` and 8000 to
 * the CMS, and a suite that fights the applications a reviewer already has
 * running is a suite they will stop running.
 */

const HOST = "127.0.0.1";

/**
 * The three states the CMS can be in, as far as the homepage can tell. They
 * are also the three worlds: one frontend is built against each.
 */
export const CMS_STATES = ["properties", "no-properties", "stopped"] as const;

export type CmsState = (typeof CMS_STATES)[number];

const WEB_PORTS: Record<CmsState, number> = {
  properties: 3210,
  "no-properties": 3211,
  stopped: 3212,
};

const CMS_PORTS: Record<CmsState, number> = {
  properties: 3220,
  "no-properties": 3221,
  // Deliberately never bound. A stopped Laravel is a refused connection, and
  // the point of A14 is that the frontend survives one.
  stopped: 3222,
};

export interface Site {
  /** The state of the CMS this frontend was built against. */
  cms: CmsState;
  /** Where this frontend answers. */
  url: string;
  /** What its `CMS_API_URL` points at. */
  cmsUrl: string;
  /** Its own build, so three incremental caches cannot mix. */
  distDir: string;
}

/**
 * Everything about a world is derived from the state it is named for, so this
 * is a description rather than a lookup and there is no table to fall out of
 * step with `CMS_STATES`.
 */
export function site(cms: CmsState): Site {
  return {
    cms,
    url: `http://${HOST}:${WEB_PORTS[cms]}`,
    cmsUrl: `http://${HOST}:${CMS_PORTS[cms]}`,
    // Under `.next` rather than beside it, so the one directory every tool
    // here already ignores covers these too.
    distDir: `.next/e2e/${cms}`,
  };
}

export const SITES: readonly Site[] = CMS_STATES.map(site);

/** The two states that answer at all, and so the two stubs to start. */
export const STUBS = SITES.filter((candidate) => candidate.cms !== "stopped");

/**
 * The host `next/image` is allowed to fetch from, which is the stub that
 * serves the pictures.
 *
 * It is given to the build and to `next start` alike. `next.config.ts` is read
 * by both, and the allowlist it builds is applied per request rather than
 * baked into the output, so a server started without this refuses the very
 * pictures its own build linked to and every card loses its photograph.
 *
 * One host for all three worlds. Only the populated one has a picture to show,
 * and giving the other two a different allowlist would be a difference between
 * them that has nothing to do with what they are testing.
 */
export const MEDIA_HOST = `${HOST}:${CMS_PORTS.properties}`;
