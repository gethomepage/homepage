import { beforeEach, describe, expect, it, vi } from "vitest";

const { NextResponse } = vi.hoisted(() => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ type: "json", body, init })),
    next: vi.fn(() => ({ type: "next" })),
  },
}));

vi.mock("next/server", () => ({ NextResponse }));

import { middleware } from "./middleware";

function createReq(host) {
  return {
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

  it("allows requests for default localhost hosts", () => {
    process.env.PORT = "3000";
    const res = middleware(createReq("localhost:3000"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("blocks requests when host is not allowed", () => {
    process.env.PORT = "3000";
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = middleware(createReq("evil.com"));

    expect(errSpy).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Host validation failed. See logs for more details." },
      { status: 400 },
    );
    expect(res.type).toBe("json");
    expect(res.init.status).toBe(400);
  });

  it("allows requests when HOMEPAGE_ALLOWED_HOSTS is '*'", () => {
    process.env.HOMEPAGE_ALLOWED_HOSTS = "*";
    const res = middleware(createReq("anything.example"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });

  it("allows requests when host is included in HOMEPAGE_ALLOWED_HOSTS", () => {
    process.env.PORT = "3000";
    process.env.HOMEPAGE_ALLOWED_HOSTS = "example.com:3000,other:3000";

    const res = middleware(createReq("example.com:3000"));

    expect(NextResponse.next).toHaveBeenCalled();
    expect(res).toEqual({ type: "next" });
  });
});
