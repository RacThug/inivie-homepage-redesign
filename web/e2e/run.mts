/**
 * The entry point of the end to end suite: `npm run test:e2e`.
 *
 * It exists because the three worlds of `servers.ts` each need a production
 * build of their own, and a build has to happen before Playwright starts the
 * server that serves it. Playwright launches `webServer` before `globalSetup`
 * runs, so the builds cannot live in the config: they live here, ahead of it.
 *
 * The order is the whole of the file. Bring the stub CMS up first, because
 * the homepage is prerendered and so reads the API while it is being built;
 * build each world against the state it is named for; hand over to Playwright;
 * take the stubs down again whatever happened.
 */

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

import { MEDIA_HOST, SITES, STUBS, type Site } from "./servers.ts";

const WEB_ROOT = fileURLToPath(new URL("..", import.meta.url));

const bin = (path: string): string =>
  fileURLToPath(new URL(`../node_modules/${path}`, import.meta.url));

const NEXT = bin("next/dist/bin/next");
const PLAYWRIGHT = bin("@playwright/test/cli.js");
const STUB = fileURLToPath(new URL("./stub-cms.mts", import.meta.url));

/** Every child is this same Node, so nothing here depends on a shell or on
 *  what a `.cmd` shim happens to be called on Windows. */
function run(args: string[], env: Record<string, string> = {}): number {
  const { status } = spawnSync(process.execPath, args, {
    cwd: WEB_ROOT,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  return status ?? 1;
}

function startStub(site: Site): ChildProcess {
  return spawn(process.execPath, [STUB], {
    cwd: WEB_ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      STUB_PORT: new URL(site.cmsUrl).port,
      STUB_MODE: site.cms,
    },
  });
}

/**
 * Polled rather than assumed. A build that starts before its CMS is listening
 * prerenders the fallback and passes, and the suite would then be asserting
 * the wrong thing about a world that looks fine.
 */
async function waitForStub(site: Site): Promise<void> {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${site.cmsUrl}/api/v1/health`);

      if (response.ok) return;
    } catch {
      // Not up yet. Anything else would be a reason to stop waiting, and
      // there is nothing else a refused connection can be.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`The stub CMS at ${site.cmsUrl} did not come up.`);
}

const LABELS: Record<Site["cms"], string> = {
  properties: "six published properties",
  "no-properties": "nothing published",
  stopped: "no CMS at all",
};

const stubs = STUBS.map(startStub);

try {
  await Promise.all(STUBS.map(waitForStub));

  for (const site of SITES) {
    console.log(`\n[e2e] building against ${LABELS[site.cms]}\n`);

    const status = run([NEXT, "build"], {
      NEXT_DIST_DIR: site.distDir,
      CMS_API_URL: site.cmsUrl,
      NEXT_PUBLIC_MEDIA_HOST: MEDIA_HOST,
    });

    if (status !== 0) {
      process.exitCode = status;
      break;
    }
  }

  if (process.exitCode === undefined) {
    process.exitCode = run([PLAYWRIGHT, "test", ...process.argv.slice(2)]);
  }
} finally {
  for (const stub of stubs) stub.kill();
}
