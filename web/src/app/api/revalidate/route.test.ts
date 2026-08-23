import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("./route");

/**
 * The write surface of API-SPEC ch. 5.2, and the only one the frontend has.
 * The refusals matter more than the acceptance: requirement S4 is that this
 * route drops nothing for a caller who cannot prove it is the CMS.
 */

const SECRET = "test-revalidate-secret";
const URL = "http://localhost:3000/api/revalidate";

function call(
  body: unknown,
  headers: Record<string, string> = { "x-revalidate-secret": SECRET },
): Promise<Response> {
  return POST(
    new Request(URL, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("REVALIDATE_SECRET", SECRET);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  revalidateTag.mockClear();
});

describe("a call carrying the shared secret", () => {
  it("drops the properties tag and says so", async () => {
    const response = await call({ tag: "properties" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      revalidated: true,
      tag: "properties",
    });
  });

  it("expires the cached page rather than letting it be served stale", async () => {
    // The point of the callback is that the next visitor sees the edit. A
    // named profile would keep serving the old page while regenerating.
    await call({ tag: "properties" });

    expect(revalidateTag).toHaveBeenCalledWith("properties", { expire: 0 });
  });
});

describe("a call that cannot prove it is the CMS", () => {
  it("refuses a wrong secret", async () => {
    const response = await call(
      { tag: "properties" },
      { "x-revalidate-secret": "not-the-secret" },
    );

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a secret of the wrong length without throwing", async () => {
    // `timingSafeEqual` throws on buffers of different sizes, which is why
    // the comparison hashes first. A crash here would be a 500 where the
    // contract says 401.
    const response = await call(
      { tag: "properties" },
      { "x-revalidate-secret": "short" },
    );

    expect(response.status).toBe(401);
  });

  it("refuses a call with no secret at all", async () => {
    const response = await call({ tag: "properties" }, {});

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses everything when the route itself has no secret configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");

    const response = await call({ tag: "properties" }, {});

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("REVALIDATE_SECRET is not set"),
    );
  });

  it("refuses before it reads the body, so nothing leaks about the tags", async () => {
    const response = await call(
      { tag: "a-tag-that-does-not-exist" },
      { "x-revalidate-secret": "not-the-secret" },
    );

    expect(response.status).toBe(401);
  });
});

describe("a call with nothing to drop", () => {
  it("refuses a tag this route does not serve", async () => {
    const response = await call({ tag: "everything" });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      revalidated: false,
      message: "Unknown tag.",
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a body with no tag in it", async () => {
    const response = await call({});

    expect(response.status).toBe(400);
  });

  it("refuses a tag that is not a string", async () => {
    const response = await call({ tag: ["properties"] });

    expect(response.status).toBe(400);
  });

  it("refuses a body that is not JSON", async () => {
    const response = await call("not json at all");

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a body that is JSON but not an object", async () => {
    const response = await call("null");

    expect(response.status).toBe(400);
  });
});
