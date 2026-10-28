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
    logger: { debug: vi.fn(), error: vi.fn() },
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
    suwayomi: {
      api: "{url}/api/graphql",
    },
  },
}));

import suwayomiProxyHandler from "./proxy";

describe("widgets/suwayomi/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns extracted counts from GraphQL response (no category)", async () => {
    getServiceWidget.mockResolvedValue({ type: "suwayomi", url: "http://su", fields: ["download", "unread"] });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 2 }, unread: { totalCount: 5 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { count: 2, label: "suwayomi.download" },
      { count: 5, label: "suwayomi.unread" },
    ]);
  });

  it("returns 401 when credentials are invalid", async () => {
    getServiceWidget.mockResolvedValue({ type: "suwayomi", url: "http://su", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const req = { query: { group: "g", service: "svc", endpoint: "graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toContain("unauthorized");
  });

  it("returns extracted counts from GraphQL response (Basic auth default)", async () => {
    getServiceWidget.mockResolvedValue({
      type: "suwayomi",
      url: "http://su",
      username: "admin",
      password: "password",
      fields: ["download", "unread"],
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 2 }, unread: { totalCount: 5 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { count: 2, label: "suwayomi.download" },
      { count: 5, label: "suwayomi.unread" },
    ]);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
  });

  it("authenticates using UI_LOGIN and Bearer Token", async () => {
    getServiceWidget.mockResolvedValue({
      type: "suwayomi",
      url: "http://su",
      auth: "ui_login",
      username: "admin",
      password: "password",
      fields: ["download", "unread"],
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { login: { accessToken: "jwt-test-token" } } })),
    ]);

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 2 }, unread: { totalCount: 5 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(httpProxy).toHaveBeenCalledTimes(2);

    expect(httpProxy.mock.calls[1][1].headers.Authorization).toMatch("Bearer jwt-test-token");
    expect(res.body).toEqual([
      { count: 2, label: "suwayomi.download" },
      { count: 5, label: "suwayomi.unread" },
    ]);
  });

  it("uses cached token on subsequent UI_LOGIN requests", async () => {
    cache.put("suwayomiProxyHandler__token.g.svc.0", "cached-token-123");

    getServiceWidget.mockResolvedValue({
      type: "suwayomi",
      url: "http://su",
      auth: "ui_login",
      username: "admin",
      password: "password",
      fields: ["download"],
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 4 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toMatch("Bearer cached-token-123");
    expect(res.body).toEqual([{ count: 4, label: "suwayomi.download" }]);
  });

  it("authenticates using SIMPLE_LOGIN via /login.html", async () => {
    getServiceWidget.mockResolvedValue({
      type: "suwayomi",
      url: "http://su",
      auth: "simple_login",
      username: "admin",
      password: "password",
      fields: ["download"],
    });

    httpProxy.mockResolvedValueOnce([303, "text/html", Buffer.from("")]);

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 4 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("login.html");
    expect(res.body).toEqual([{ count: 4, label: "suwayomi.download" }]);
  });

  it("returns 401 when UI_LOGIN authentication fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "suwayomi",
      url: "http://su",
      auth: "simple_login",
      username: "admin",
      password: "password",
      fields: ["download"],
    });

    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toContain("unauthorized");
  });
});
