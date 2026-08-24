/**
 * Where this site answers, as one origin the whole application agrees on.
 *
 * A canonical URL, an Open Graph image and a sitemap all have to be absolute,
 * and all three have to name the same host or they are worse than absent: a
 * canonical pointing somewhere the sitemap does not is an instruction to a
 * crawler to index a page that says it lives elsewhere. So the host is read
 * once, here, and PRD ch. 8.3's four SEO artefacts derive from it.
 *
 * It is deliberately not `NEXT_PUBLIC_`. Everything that needs it - metadata,
 * `robots.ts`, `sitemap.ts` - runs on the server, for the same reason
 * `CMS_API_URL` carries no prefix either.
 */

/** Local development, which is the only place the variable may be missing. */
const FALLBACK = "http://localhost:3000";

/**
 * The origin, with no trailing slash.
 *
 * A malformed value falls back rather than throwing. A site that will not
 * build because someone typed `inivie.com` without a scheme has turned a
 * metadata problem into an outage, and the fallback is visible in the emitted
 * `<link rel="canonical">` the moment anybody looks.
 */
export function siteOrigin(): string {
  const configured = process.env.SITE_URL?.trim();

  if (!configured) return FALLBACK;

  try {
    return new URL(configured).origin;
  } catch {
    return FALLBACK;
  }
}

/** An absolute URL for a path on this site. */
export function siteUrl(path = "/"): string {
  return new URL(path, siteOrigin()).toString();
}
