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
    freshrss: {
      api: "{url}/{endpoint}",
    },
  },
}));

import freshrssProxyHandler from "./proxy";

describe("widgets/freshrss/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in, caches token, and returns subscription + unread counts", async () => {
    getServiceWidget.mockResolvedValue({
      type: "freshrss",
      url: "http://fresh",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("SID=1\nAuth=token123\n")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ subscriptions: [1, 2, 3] }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ max: 7 }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await freshrssProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://fresh/accounts/ClientLogin");
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe("GoogleLogin auth=token123");
    expect(httpProxy.mock.calls[2][1].headers.Authorization).toBe("GoogleLogin auth=token123");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ subscriptions: 3, unread: 7 });
  });

  it("retries API calls after a 401 by obtaining a new session token", async () => {
    cache.put("freshrssProxyHandler__sessionToken.svc", "old");

    getServiceWidget.mockResolvedValue({
      type: "freshrss",
      url: "http://fresh",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("{}")])
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("SID=1\nAuth=newtok\n")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ subscriptions: [1] }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ max: 2 }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await freshrssProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("accounts/ClientLogin"));
    expect(loginCalls).toHaveLength(1);
    const listCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("subscription/list"));
    expect(listCalls).toHaveLength(2);
    expect(res.body).toEqual({ subscriptions: 1, unread: 2 });
  });
});
