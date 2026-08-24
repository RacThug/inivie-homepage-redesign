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
 * The origin, with no trailing slash. `siteUrl` below is the one that
 * resolves a path against it, and its result carries one.
 *
 * Unset is the local case and takes the fallback. Set but unparseable is a
 * typo, and it throws: everything downstream is a URL somebody else will read
 * back - a canonical, a sitemap, a sharing card - so the failure to avoid is
 * the quiet one, where a deployment ships pointing at localhost and nothing
 * says so until a crawler has believed it. This runs while the page's
 * metadata is built, so the build is where it stops.
 */
export function siteOrigin(): string {
  const configured = process.env.SITE_URL?.trim();

  if (!configured) return FALLBACK;

  try {
    return new URL(configured).origin;
  } catch {
    throw new Error(
      `SITE_URL is not a URL: ${configured}. It wants a scheme and a host, as in https://inivie.com.`,
    );
  }
}

/** An absolute URL for a path on this site. */
export function siteUrl(path = "/"): string {
  return new URL(path, siteOrigin()).toString();
}
