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
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });
});
