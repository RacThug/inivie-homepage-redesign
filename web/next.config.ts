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
  },
};

export default nextConfig;
