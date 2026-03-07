import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, logger } = vi.hoisted(() => {
  const store = new Map();

  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => store.get(k)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    shelfmark: {
      api: "{url}/api/{endpoint}",
      loginURL: "{url}/api/auth/login",
    },
  },
}));

import shelfmarkProxyHandler from "./proxy";

describe("widgets/shelfmark/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when Shelfmark credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "shelfmark", url: "https://shelfmark.example.com" });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await shelfmarkProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing Shelfmark credentials" });
  });

  it("returns 400 when Shelfmark URL is missing", async () => {
    getServiceWidget.mockResolvedValue({
      type: "shelfmark",
      username: "u",
      password: "p",
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await shelfmarkProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing Shelfmark URL" });
  });

  it("logs in and summarizes status object lengths from /status", async () => {
    getServiceWidget.mockResolvedValue({
      type: "shelfmark",
      url: "https://shelfmark.example.com",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ accessToken: "tok" }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            available: { a: { id: 1 }, b: { id: 2 } },
            cancelled: {},
            complete: { c: { id: 3 } },
            done: { d: { id: 4 }, e: { id: 5 }, f: { id: 6 } },
            queued: [{ id: 7 }, { id: 8 }],
            meta: { healthy: true },
          }),
        ),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await shelfmarkProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      statuses: {
        available: 2,
        cancelled: 0,
        complete: 1,
        done: 3,
        queued: 2,
      },
    });
  });
});
