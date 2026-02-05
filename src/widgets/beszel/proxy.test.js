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
    beszel: {
      api: "{url}/{endpoint}",
      mappings: {
        authv1: { endpoint: "api/auth" },
        authv2: { endpoint: "api/auth/v2" },
      },
    },
  },
}));

import beszelProxyHandler from "./proxy";

describe("widgets/beszel/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in when token is missing and uses Bearer token for requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "beszel",
      url: "http://beszel",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "t1" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ items: [1] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "items", index: "0" } };
    const res = createMockRes();

    await beszelProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://beszel/api/auth");
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://beszel/items");
    expect(httpProxy.mock.calls[1][1]).toEqual({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer t1",
      },
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify({ items: [1] })));
  });

  it("retries after receiving an empty list by clearing cache and logging in again", async () => {
    cache.put("beszelProxyHandler__token.svc", "old");

    getServiceWidget.mockResolvedValue({
      type: "beszel",
      url: "http://beszel",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ items: [] }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "new" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ items: [1] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "items", index: "0" } };
    const res = createMockRes();

    await beszelProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer old");
    expect(httpProxy.mock.calls[1][0]).toBe("http://beszel/api/auth");
    expect(httpProxy.mock.calls[2][1].headers.Authorization).toBe("Bearer new");
    expect(res.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify({ items: [1] })));
  });
});
