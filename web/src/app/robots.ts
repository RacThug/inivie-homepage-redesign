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
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
