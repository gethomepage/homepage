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
    npm: {
      api: "{url}/{endpoint}",
    },
  },
}));

import npmProxyHandler from "./proxy";

describe("widgets/npm/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in when token is missing and uses Bearer token for requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "npm",
      url: "http://npm",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ token: "t1", expires: new Date(Date.now() + 60_000).toISOString() })),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/stats", index: "0" } };
    const res = createMockRes();

    await npmProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://npm/api/tokens");
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe("Bearer t1");
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("retries after a 403 response by clearing cache and logging in again", async () => {
    cache.put("npmProxyHandler__token.svc", "old");

    getServiceWidget.mockResolvedValue({
      type: "npm",
      url: "http://npm",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([403, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ token: "new", expires: new Date(Date.now() + 60_000).toISOString() })),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/stats", index: "0" } };
    const res = createMockRes();

    await npmProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer old");
    expect(httpProxy.mock.calls[1][0]).toBe("http://npm/api/tokens");
    expect(httpProxy.mock.calls[2][1].headers.Authorization).toBe("Bearer new");
    expect(res.body).toEqual(Buffer.from("ok"));
  });
});
