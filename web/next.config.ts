import type { NextConfig } from "next";

/**
 * Where property images are served from. TECHNICAL-DESIGN ch. 5.5 keeps this a
 * configuration value rather than a literal, because `next/image` refuses any
 * host it has not been told about: a hardcoded pattern would turn a one line
 * storage move into every image on the homepage silently failing to render.
 */
const MEDIA_HOST = process.env.NEXT_PUBLIC_MEDIA_HOST ?? "localhost:8000";

/**
 * The variable carries a host, not an origin, so the scheme is derived. A
 * loopback host is the local CMS over plain HTTP; anything else is a real
 * deployment, and a real deployment serves media over TLS.
 */
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Parsed rather than split on ":", because an IPv6 host is written
 * `[::1]:8000` and splitting it yields "[". A loopback host that fails the
 * loopback test is the worst of the three outcomes: the images go quiet and
 * the reason is a punctuation mark.
 */
const isLocalCms = LOOPBACK.has(new URL(`http://${MEDIA_HOST}`).hostname);
const origin = `${isLocalCms ? "http" : "https"}://${MEDIA_HOST}`;

const nextConfig: NextConfig = {
  images: {
    // One pinned host, every path under it. The host is the boundary here;
    // narrowing the path as well would break on a move to object storage,
    // which is the exact change ch. 5.5 exists to keep cheap.
    remotePatterns: [new URL(`${origin}/**`)],

    /**
     * Next 16 refuses to optimise an image whose host resolves to a private
     * address, because an open optimiser is an SSRF hole into a private
     * network. The local CMS on `localhost:8000` is exactly that case, so the
     * refusal has to be lifted for it, and only for it: the flag is tied to
     * the same loopback test as the scheme above, so pointing
     * `NEXT_PUBLIC_MEDIA_HOST` at a real CDN turns it off again without
     * anybody remembering to.
     *
     * What is being allowed stays narrow either way. `remotePatterns` above
     * pins one host, so the optimiser will not fetch anything else on the
     * network whatever this is set to.
     */
    dangerouslyAllowLocalIP: isLocalCms,

    /**
     * 75 is Next's default and is what every image on the page uses except
     * one. The hero poster takes 60, because it is the only image here that
     * is never seen undimmed: it sits under the ink gradient of ch. 6.8, at
     * full opacity across the top and 40 per cent from the middle down, so
     * the detail the extra 15 points buys is being painted over. It was the
     * largest image on the route at 50KB, and it is fetched before anything
     * else the visitor is waiting for.
     *
     * Both have to be listed. Next 16 refuses any quality not declared here,
     * so that the optimiser cannot be asked for arbitrary variants of an
     * image by anyone who can edit a URL.
     */
    qualities: [60, 75],
  },
};

export default nextConfig;
