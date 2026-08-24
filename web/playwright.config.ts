import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { MEDIA_HOST, SITES } from "./e2e/servers.ts";

/**
 * End to end coverage of the four paths TECHNICAL-DESIGN ch. 9.1 names: the
 * homepage shows cards, the section disappears on empty data, the fallback
 * appears when the CMS is down, and the mobile navigation opens and closes.
 *
 * Three servers rather than one, because the homepage is prerendered and the
 * CMS state is therefore fixed at build time. `e2e/servers.ts` is the table of
 * them and carries the reasoning; `e2e/run.mts` builds them.
 *
 * Chromium alone. What this suite tests is the frontend against three states
 * of its own API, which is not a thing browsers disagree about, and the
 * component suite already covers the markup that they would.
 */

/**
 * A build per world, made by `npm run test:e2e`. Playwright starts `webServer`
 * before `globalSetup`, so the builds cannot be made from inside this config,
 * and `next start` on a directory that does not exist fails with a message
 * about the directory rather than about the missing step.
 */
const unbuilt = SITES.filter(
  (site) => !existsSync(resolve(site.distDir, "BUILD_ID")),
);

if (unbuilt.length > 0) {
  throw new Error(
    `No build in ${unbuilt.map((site) => site.distDir).join(", ")}. ` +
      "Run `npm run test:e2e`, which builds the three sites and then runs this suite.",
  );
}

export default defineConfig({
  testDir: "./e2e",
  // The stub, the runner and the server table live beside the specs and are
  // not specs themselves.
  testMatch: "**/*.spec.ts",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  /**
   * No retries, here or on CI. A test that passes on the second attempt is a
   * test nobody trusts, and the three worlds share nothing that could make one
   * flaky in the first place.
   */
  retries: 0,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  webServer: SITES.map((site) => ({
    command: `node node_modules/next/dist/bin/next start --port ${new URL(site.url).port} --hostname 127.0.0.1`,
    url: site.url,
    env: {
      NEXT_DIST_DIR: site.distDir,
      CMS_API_URL: site.cmsUrl,
      /**
       * `next.config.ts` is read again by `next start`, and the image
       * allowlist it builds is applied per request rather than baked in. So
       * the media host has to be given to the server as well as to the build,
       * or the optimiser refuses the very pictures the build linked to.
       */
      NEXT_PUBLIC_MEDIA_HOST: MEDIA_HOST,
      SITE_URL: site.url,
    },
    /**
     * Never reuse. Each run rebuilds, so a server left listening from a
     * previous one is serving a build that no longer exists on disk, and it
     * would answer every request happily.
     */
    reuseExistingServer: false,
    timeout: 60_000,
  })),
});
