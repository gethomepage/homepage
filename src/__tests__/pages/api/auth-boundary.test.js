import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn(async () => null) }));
vi.mock("utils/logger", () => ({ default: () => ({ error: vi.fn(), warn: vi.fn(), debug: vi.fn(), info: vi.fn() }) }));

const allRoutes = Object.entries(import.meta.glob("/src/pages/api/**/*.js"));
const routes = allRoutes.filter(([file]) => !/\/(auth|mcp)\//.test(file) && !file.endsWith("/healthcheck.js"));

describe("API authentication without middleware", () => {
  beforeEach(() => vi.stubEnv("HOMEPAGE_AUTH_ENABLED", "true"));
  afterEach(() => vi.unstubAllEnvs());

  it.each(routes)("rejects anonymous access to %s at its exported handler", async (_file, load) => {
    const { default: handler } = await load();
    const req = { query: {}, headers: { "x-prerender-revalidate": "public-image-key" }, cookies: {} };
    const res = createMockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(res.headers["Cache-Control"]).toBe("private, no-store");
  });

  it("keeps sign-in CSS public while protecting custom JavaScript", async () => {
    const { default: handler } = await import("pages/api/config/[path]");
    const css = createMockRes();
    await handler({ query: { path: "custom.css" } }, css);
    expect(css.statusCode).toBe(200);
    const js = createMockRes();
    await handler({ query: { path: "custom.js" }, headers: {}, cookies: {} }, js);
    expect(js.statusCode).toBe(401);
  });
});

describe("API host validation without middleware", () => {
  beforeEach(() => {
    vi.stubEnv("HOMEPAGE_ALLOWED_HOSTS", "");
    vi.stubEnv("PORT", "3000");
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(allRoutes)("rejects disallowed hosts at %s, including public routes", async (_file, load) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { default: handler } = await load();
    const req = {
      query: { path: "custom.css", nextauth: ["session"] },
      method: "POST",
      headers: { host: "evil.example", "x-prerender-revalidate": "public-image-key" },
      cookies: {},
    };
    const res = createMockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Host validation failed. See logs for more details." });
  });
});
