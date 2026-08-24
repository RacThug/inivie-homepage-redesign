import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * `sitemap.xml`, per PRD ch. 8.3.
 *
 * One entry, because this project builds one route. The rest of inivie.com is
 * production's and is not served from here, so listing it would point a
 * crawler at pages this application does not have (PRD ch. 3.2).
 *
 * `lastModified` is the moment the route was rendered, which for a
 * revalidating static page is the last time its content could have changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
