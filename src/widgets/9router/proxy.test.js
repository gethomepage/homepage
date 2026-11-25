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
    "9router": {
      api: "{url}/api/{endpoint}",
    },
  },
}));

import nineRouterProxyHandler from "./proxy";

describe("widgets/9router/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in when token is missing and fetches providers", async () => {
    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(""),
        { "set-cookie": "auth_token=token123; Path=/" },
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ connections: [1, 2] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://9router/api/auth/login");
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://9router/api/providers");
    expect(httpProxy.mock.calls[1][1].headers.Cookie).toBe("auth_token=token123");
    expect(res.send).toHaveBeenCalled();
  });

  it("returns 400 for invalid proxy requests", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid proxy service type" });
  });

  it("returns 403 for unsupported widgets", async () => {
    getServiceWidget.mockResolvedValue({ type: "other", url: "http://9router", password: "secret" });

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 401 when login fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns upstream status for failed data requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(""),
        { "set-cookie": "auth_token=token123; Path=/" },
      ])
      .mockResolvedValueOnce([500, "application/json", Buffer.from("boom")]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("extracts token from an array of set-cookie headers", async () => {
    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(""),
        { "set-cookie": ["auth_token=arraytoken; Path=/", "other=value"] },
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ connections: [] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(httpProxy.mock.calls[1][1].headers.Cookie).toBe("auth_token=arraytoken");
    expect(res.send).toHaveBeenCalled();
  });

  it("returns 401 when login succeeds without a token", async () => {
    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(""), { "set-cookie": "other=value" }]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when retry login fails", async () => {
    cache.put("9routerProxyHandler__token.svc", "expired");

    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("{}")])
      .mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("handles a missing widget", async () => {
    getServiceWidget.mockResolvedValue(undefined);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 401 when retry login succeeds without a token", async () => {
    cache.put("9routerProxyHandler__token.svc", "expired");

    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("{}")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(""), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("retries after a 401 by clearing cache and logging in again", async () => {
    cache.put("9routerProxyHandler__token.svc", "expired");

    getServiceWidget.mockResolvedValue({
      type: "9router",
      url: "http://9router",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("{}")])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(""),
        { "set-cookie": "auth_token=newtoken; Path=/" },
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ connections: [1] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "providers", index: "0" } };
    const res = createMockRes();

    await nineRouterProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(res.send).toHaveBeenCalled();
  });
});
