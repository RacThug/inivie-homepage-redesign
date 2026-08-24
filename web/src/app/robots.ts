import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * `robots.txt`, per PRD ch. 8.3.
 *
 * Generated rather than a static file in `public/`, because the one line that
 * matters in it is the absolute URL of the sitemap, and that URL has to come
 * from the same place the canonical does or the two disagree about where this
 * site lives (`lib/site.ts`).
 *
 * Everything is crawlable. There is one route, and `/api/revalidate` is a
 * POST endpoint a crawler cannot reach with a GET anyway - disallowing it
 * would advertise it rather than protect it, and what protects it is the
 * shared secret in API-SPEC ch. 5.2.
 *
 * No `host` line. It is a Yandex extension rather than part of the standard,
 * it wants a bare hostname where everything else here is a URL, and what it
 * exists to settle - which mirror is canonical - the canonical link element
 * already settles for every crawler that reads it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
