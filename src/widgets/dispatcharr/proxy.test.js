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
    dispatcharr: {
      api: "{url}/{endpoint}",
      mappings: {
        token: { endpoint: "auth/token" },
      },
    },
  },
}));

import dispatcharrProxyHandler from "./proxy";

describe("widgets/dispatcharr/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in when token is missing and uses Bearer token for requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "dispatcharr",
      url: "http://dispatcharr",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ access: "t1" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "items", index: "0" } };
    const res = createMockRes();

    await dispatcharrProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://dispatcharr/auth/token");
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe("Bearer t1");
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("retries after a bad response by clearing cache and logging in again", async () => {
    cache.put("dispatcharrProxyHandler__token.svc", "old");

    getServiceWidget.mockResolvedValue({
      type: "dispatcharr",
      url: "http://dispatcharr",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([400, "application/json", Buffer.from(JSON.stringify({ items: [] }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ access: "new" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", endpoint: "items", index: "0" } };
    const res = createMockRes();

    await dispatcharrProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://dispatcharr/auth/token");
    expect(httpProxy.mock.calls[2][1].headers.Authorization).toBe("Bearer new");
    expect(res.body).toEqual(Buffer.from("ok"));
  });
});
