import { beforeEach, describe, expect, it, vi } from "vitest";

const { NextResponse, getToken } = vi.hoisted(() => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    redirect: vi.fn((url) => ({ type: "redirect", url })),
  },
  getToken: vi.fn(),
}));

vi.mock("next/server", () => ({ NextResponse }));
vi.mock("next-auth/jwt", () => ({ getToken }));

async function loadMiddleware() {
  vi.resetModules();
  const mod = await import("./middleware");
  return mod.middleware;
}

function createReq(url = "http://localhost:3000/") {
  return {
    url,
    headers: {
      get: () => null,
    },
  };
}

describe("middleware", () => {
  const originalEnv = process.env;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    console.warn = originalConsoleWarn;
  });

  it("allows requests when auth is disabled", async () => {
    const middleware = await loadMiddleware();
    const res = await middleware(createReq());

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("warns once when HOMEPAGE_ALLOWED_HOSTS is set, but does not block", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.HOMEPAGE_ALLOWED_HOSTS = "example.com";

    const middleware = await loadMiddleware();
    const res1 = await middleware(createReq());
    const res2 = await middleware(createReq());

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(NextResponse.next).toHaveBeenCalled();
    expect(res1).toEqual({ type: "next" });
    expect(res2).toEqual({ type: "next" });
  });

  it("redirects to signin when auth is enabled and no token is present", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_SECRET = "secret";

    getToken.mockResolvedValueOnce(null);

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("http://localhost:3000/some"));

    expect(getToken).toHaveBeenCalledWith({
      req: expect.objectContaining({ url: "http://localhost:3000/some" }),
      secret: "secret",
    });
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(res.type).toBe("redirect");
    expect(String(res.url)).toContain("/auth/signin");
  });

  it("allows requests when auth is enabled and a token is present", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_SECRET = "secret";

    getToken.mockResolvedValueOnce({ sub: "user" });

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("http://localhost:3000/"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });
});
