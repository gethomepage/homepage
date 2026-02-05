import { beforeEach, describe, expect, it, vi } from "vitest";

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
    pihole: {
      apiv5: "{url}/{endpoint}",
      api: "{url}/{endpoint}",
    },
  },
}));

import piholeProxyHandler from "./proxy";

function createRes() {
  const res = {
    statusCode: null,
    body: null,
  };

  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body) => {
    res.body = body;
    return res;
  });
  res.send = vi.fn((body) => {
    res.body = body;
    return res;
  });

  return res;
}

describe("widgets/pihole/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("proxies Pi-hole v5 via apiv5 summaryRaw and returns raw data", async () => {
    getServiceWidget.mockResolvedValue({ type: "pihole", version: 5, url: "http://pi" });
    httpProxy.mockResolvedValue([200, "application/json", '{"ok":true}']);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createRes();

    await piholeProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("http://pi/summaryRaw");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"ok":true}');
  });

  it("proxies Pi-hole v6 without auth when key is missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "pihole", version: 6, url: "http://pi" });
    httpProxy.mockResolvedValue([
      200,
      "application/json",
      JSON.stringify({
        gravity: { domains_being_blocked: 123 },
        queries: { blocked: 4, percent_blocked: 5.5, total: 99 },
      }),
    ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createRes();

    await piholeProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("http://pi/stats/summary", {
      headers: { "Content-Type": "application/json" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      domains_being_blocked: 123,
      ads_blocked_today: 4,
      ads_percentage_today: 5.5,
      dns_queries_today: 99,
    });
  });

  it("returns 500 when key is provided but login fails and no SID is cached", async () => {
    getServiceWidget.mockResolvedValue({ type: "pihole", version: 6, url: "http://pi", key: "pw" });
    httpProxy.mockResolvedValueOnce([401, "application/json", JSON.stringify({ session: null })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createRes();

    await piholeProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to authenticate with Pi-hole" });
  });

  it("logs in and uses X-FTL-SID header for Pi-hole v6 when key is provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "pihole", version: 6, url: "http://pi", key: "pw" });
    httpProxy
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ session: { sid: "sid123", validity: 1000 } })])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          gravity: { domains_being_blocked: 1 },
          queries: { blocked: 2, percent_blocked: 3, total: 4 },
        }),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createRes();

    await piholeProxyHandler(req, res);

    // First call: login endpoint
    expect(httpProxy).toHaveBeenNthCalledWith(
      1,
      "http://pi/auth",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "pw" }),
      }),
    );

    // Second call: stats/summary with SID header
    expect(httpProxy).toHaveBeenNthCalledWith(
      2,
      "http://pi/stats/summary",
      expect.objectContaining({
        headers: { "Content-Type": "application/json", "X-FTL-SID": "sid123" },
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.dns_queries_today).toBe(4);
  });
});
