import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, getPrivateWidgetOptions, cache, cookieJar, logger } = vi.hoisted(() => {
  const store = new Map();
  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    getPrivateWidgetOptions: vi.fn(),
    cache: {
      get: vi.fn((k) => (store.has(k) ? store.get(k) : null)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    cookieJar: {
      addCookieToJar: vi.fn(),
      setCookieHeader: vi.fn(),
    },
    logger: { debug: vi.fn(), error: vi.fn() },
  };
});

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/config/widget-helpers", () => ({
  getPrivateWidgetOptions,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));
vi.mock("utils/proxy/cookie-jar", () => cookieJar);
vi.mock("widgets/widgets", () => ({
  default: {
    unifi: {
      api: "{url}{prefix}/api/{endpoint}",
      apiv2: "{url}/proxy/network/integration/v1/{endpoint}",
    },
  },
}));

import unifiProxyHandler from "./proxy";

describe("widgets/unifi/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("auto-detects prefix, logs in on 401, and retries the request", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      username: "u",
      password: "p",
    });

    httpProxy
      // autodetect call -> csrf header indicates udmp prefix
      .mockResolvedValueOnce([200, "text/html", Buffer.from(""), { "x-csrf-token": "csrf" }])
      // initial api call -> unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope"), { "x-csrf-token": "csrf2" }])
      // login -> ok
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ meta: { rc: "ok" } })),
        { "set-cookie": ["sid=1"] },
      ])
      // retry api call -> ok
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "self", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(httpProxy.mock.calls[1][0].toString()).toContain("/proxy/network/api/self");
    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
    expect(cookieJar.setCookieHeader).toHaveBeenLastCalledWith(expect.any(URL), expect.any(Object), {
      overwrite: true,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("uses unifi_console private widget config for the info widget path", async () => {
    getPrivateWidgetOptions.mockResolvedValue({
      url: "http://console",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "text/html", Buffer.from(""), { "x-csrf-token": "csrf" }])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data"), {}]);

    const req = {
      query: {
        group: "unifi_console",
        service: "unifi_console",
        endpoint: "self",
        query: JSON.stringify({ index: 2 }),
      },
    };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(getPrivateWidgetOptions).toHaveBeenCalledWith("unifi_console", 2);
    expect(httpProxy.mock.calls[1][0].toString()).toContain("/proxy/network/api/self");
    expect(res.statusCode).toBe(200);
  });

  it("uses the API key flow without attempting login", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      key: "secret",
      url: "http://unifi",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("data"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "self", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("/proxy/network/api/self");
    expect(httpProxy.mock.calls[0][1]).toMatchObject({
      headers: {
        Accept: "application/json",
        "X-API-KEY": "secret",
      },
      method: "GET",
    });
    expect(res.statusCode).toBe(200);
  });

  it("reshapes integration API responses into the legacy stat/sites structure", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      key: "secret",
      version: 2,
    });

    httpProxy
      // sites
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ totalCount: 1, data: [{ id: "site-1", name: "Mahrnet" }] })),
        {},
      ])
      // wired client count
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ totalCount: 0, data: [] })), {}])
      // wireless client count
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ totalCount: 28, data: [] })), {}])
      // devices
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            totalCount: 1,
            data: [{ id: "ap-1", name: "ap01", model: "U6 Pro", state: "ONLINE", features: ["accessPoint"] }],
          }),
        ),
        {},
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://unifi/proxy/network/integration/v1/sites");
    expect(httpProxy.mock.calls[1][0].toString()).toContain("/sites/site-1/clients?limit=1&filter=type.eq(");
    expect(httpProxy.mock.calls[3][0].toString()).toContain("/sites/site-1/devices?offset=0&limit=200");
    expect(httpProxy.mock.calls[0][1]).toMatchObject({
      headers: { "X-API-KEY": "secret", Accept: "application/json" },
      method: "GET",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      meta: { rc: "ok" },
      data: [
        {
          name: "default",
          desc: "Mahrnet",
          health: [
            { subsystem: "wan", status: "unknown" },
            { subsystem: "lan", status: "unknown", num_user: 0, num_adopted: 0 },
            { subsystem: "wlan", status: "ok", num_user: 28, num_adopted: 1 },
          ],
        },
      ],
    });
  });

  it("reports gateway uptime and wan status when a gateway is adopted", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      key: "secret",
      version: 2,
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ totalCount: 1, data: [{ id: "site-1", name: "Mahrnet" }] })),
        {},
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ totalCount: 3, data: [] })), {}])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ totalCount: 28, data: [] })), {}])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            totalCount: 2,
            data: [
              { id: "ap-1", name: "ap01", model: "U6 Pro", state: "ONLINE", features: ["accessPoint"] },
              { id: "gw-1", name: "gw", model: "UCG-Ultra", state: "ONLINE", features: [] },
            ],
          }),
        ),
        {},
      ])
      // latest statistics for the gateway
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ uptimeSec: 172800 })), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(5);
    expect(httpProxy.mock.calls[4][0].toString()).toContain("/devices/gw-1/statistics/latest");
    expect(res.body.data[0].health[0]).toEqual({
      subsystem: "wan",
      status: "ok",
      "gw_system-stats": { uptime: 172800 },
    });
    expect(res.body.data[0].health[1]).toMatchObject({ status: "ok", num_user: 3 });
  });

  it("returns 404 when the configured site name doesn't exist", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      key: "secret",
      version: 2,
      site: "Nope",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ totalCount: 1, data: [{ id: "site-1", name: "Mahrnet" }] })),
      {},
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toContain("Nope");
  });

  it("returns 400 when version 2 is configured without an API key", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      username: "u",
      password: "p",
      version: 2,
    });

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it("propagates upstream errors from the integration API", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      key: "secret",
      version: 2,
    });

    httpProxy.mockResolvedValueOnce([403, "application/json", Buffer.from("denied"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
  });

  it("uses the legacy API when version is 1", async () => {
    getServiceWidget.mockResolvedValue({
      type: "unifi",
      url: "http://unifi",
      key: "secret",
      version: 1,
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("data"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "stat/sites", index: "0" } };
    const res = createMockRes();

    await unifiProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][0].toString()).toContain("/proxy/network/api/stat/sites");
  });
});
