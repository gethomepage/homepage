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
    guacamole: {
      api: "{url}/api/session/data/{datasource}/{endpoint}",
    },
  },
}));

import guacamoleProxyHandler from "./proxy";

describe("widgets/guacamole/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in when no session is cached and requests data using the returned token and dataSource", async () => {
    getServiceWidget.mockResolvedValue({
      type: "guacamole",
      url: "http://guacamole",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ authToken: "t1", dataSource: "mysql" })),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "activeConnections", index: "0" } };
    const res = createMockRes();

    await guacamoleProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://guacamole/api/tokens");

    const dataUrl = httpProxy.mock.calls[1][0];
    expect(dataUrl.toString()).toBe("http://guacamole/api/session/data/mysql/activeConnections?token=t1");
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("retries after a 403 response by clearing the cached session and logging in again", async () => {
    cache.put("guacamoleProxyHandler__token.svc", "old");
    cache.put("guacamoleProxyHandler__dataSource.svc", "mysql");

    getServiceWidget.mockResolvedValue({
      type: "guacamole",
      url: "http://guacamole",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([403, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ authToken: "new", dataSource: "mysql" })),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", endpoint: "activeConnections", index: "0" } };
    const res = createMockRes();

    await guacamoleProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("token=old");
    expect(httpProxy.mock.calls[1][0]).toBe("http://guacamole/api/tokens");
    expect(httpProxy.mock.calls[2][0].toString()).toContain("token=new");
    expect(res.body).toEqual(Buffer.from("ok"));
  });

  it("prefers an explicitly configured dataSource over the one returned at login", async () => {
    getServiceWidget.mockResolvedValue({
      type: "guacamole",
      url: "http://guacamole",
      username: "u",
      password: "p",
      datasource: "ldap",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ authToken: "t1", dataSource: "mysql" })),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "users", index: "0" } };
    const res = createMockRes();

    await guacamoleProxyHandler(req, res);

    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://guacamole/api/session/data/ldap/users?token=t1");
  });
});
