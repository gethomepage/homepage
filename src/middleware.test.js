import { beforeEach, describe, expect, it, vi } from "vitest";

const { NextResponse, getToken } = vi.hoisted(() => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ type: "json", body, init })),
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

function createReq(host = "localhost:3000", url = "http://localhost:3000/") {
  return {
    url,
    headers: {
      get: (key) => (key === "host" ? host : null),
    },
  };
}

describe("middleware", () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    console.error = originalConsoleError;
  });

  it("allows requests for default localhost hosts when auth is disabled", async () => {
    process.env.PORT = "3000";

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("localhost:3000"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("blocks requests when host is not allowed", async () => {
    process.env.PORT = "3000";
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("evil.com"));

    expect(errSpy).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Host validation failed. See logs for more details." },
      { status: 400 },
    );
    expect(getToken).not.toHaveBeenCalled();
    expect(res.type).toBe("json");
    expect(res.init.status).toBe(400);
  });

  it("allows requests when HOMEPAGE_ALLOWED_HOSTS is '*'", async () => {
    process.env.HOMEPAGE_ALLOWED_HOSTS = "*";

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("anything.example"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows requests when host is included in HOMEPAGE_ALLOWED_HOSTS", async () => {
    process.env.PORT = "3000";
    process.env.HOMEPAGE_ALLOWED_HOSTS = "example.com:3000,other:3000";

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("example.com:3000", "http://example.com:3000/"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows healthcheck requests without auth when host is allowed", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_SECRET = "secret";

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("localhost:3000", "http://localhost:3000/api/healthcheck"));

    expect(getToken).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("redirects to signin when auth is enabled and no token is present", async () => {
    process.env.HOMEPAGE_AUTH_ENABLED = "true";
    process.env.HOMEPAGE_AUTH_SECRET = "secret";

    getToken.mockResolvedValueOnce(null);

    const middleware = await loadMiddleware();
    const res = await middleware(createReq("localhost:3000", "http://localhost:3000/some"));

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
    const res = await middleware(createReq("localhost:3000", "http://localhost:3000/"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });
});
