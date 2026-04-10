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

import omadaProxyHandler from "./proxy";

describe("widgets/omada/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    httpProxy.mockReset();
    getServiceWidget.mockReset();
    cache._reset();
  });

  it("fetches controller info, logs in, selects site, and returns overview stats (v4)", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      // controller info
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      // login
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      // sites list
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      // overview diagram
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      // alert count
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(5);
    expect(res.statusCode).toBe(null); // uses res.send directly without setting status
    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 2,
        activeUser: 10,
        alerts: 4,
        connectedGateways: 1,
        connectedSwitches: 3,
      }),
    );
    expect(httpProxy.mock.calls[2][1]).toMatchObject({
      headers: {
        "Csrf-Token": "t",
        Cookie: "TPOMADA_SESSIONID=sid",
      },
    });
  });

  it("returns an error when controller info cannot be retrieved", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy.mockResolvedValueOnce([503, "application/json", "down"]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(logger.error).toHaveBeenCalledWith("Unable to retrieve Omada controller info");
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      error: { message: "HTTP Error 503", url: "http://omada/api/info", data: "down" },
    });
  });

  it("returns an error when controller version cannot be determined", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "7.0.0" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Error determining controller version");
  });

  it("returns an error when login fails (errorCode > 0)", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ errorCode: 1, msg: "nope" }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.message).toBe("Error logging in to Omada controller");
    expect(res.body.error.url).toBe("http://omada/api/v2/login");
    expect(res.body.error.data).toEqual({ errorCode: 1, msg: "nope" });
  });

  it("returns an error when sites list retrieval fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 2, msg: "bad" })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(logger.debug).toHaveBeenCalledWith("HTTP 200 getting sites list: bad");
    expect(res.statusCode).toBe(200);
    expect(res.body.error.message).toBe("Error getting sites list");
  });

  it("returns an error when the site is not found", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Missing" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.message).toContain("Site Missing is not found");
  });

  it("handles the v3 controller flow: login, getUserSites, switchSite, and getGlobalStat", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      // controller info parse fails -> defaults to 3.2.x
      .mockResolvedValueOnce([200, "application/json", "not-json"])
      // login v3
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      // getUserSites
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { siteList: [{ name: "Default", siteName: "site1" }] } }),
      ])
      // switchSite
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ errorCode: 0 }))])
      // getGlobalStat
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { connectedAp: 3, activeUser: 11, alerts: 2 } }),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    // login body includes v3 RPC shape
    expect(JSON.parse(httpProxy.mock.calls[1][1].body)).toMatchObject({
      username: "u",
      password: "p",
      method: "login",
      params: { name: "u", password: "p" },
    });

    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 3,
        activeUser: 11,
        alerts: 2,
        connectedGateways: undefined,
        connectedSwitches: undefined,
      }),
    );
  });

  it("returns an error when v3 site switching fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", "not-json"])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { siteList: [{ name: "Default", siteName: "site1" }] } }),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ errorCode: 1 }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.message).toBe("Error switching site");
  });

  it("returns a structured error when overview stats retrieval fails (v5)", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://omada", username: "u", password: "p", site: "Default" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "5.0.0" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", id: "siteid" }] } }),
      ])
      // overview fails
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 1, msg: "bad" })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: {
        message: "Error getting stats",
        url: "http://omada/cid/api/v2/sites/siteid/dashboard/overviewDiagram?token=t&currentPage=1&currentPageSize=1000",
        data: { errorCode: 1, msg: "bad" },
      },
    });
  });

  it("reuses a cached Omada session across polls", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };

    await omadaProxyHandler(req, createMockRes());
    await omadaProxyHandler(req, createMockRes());

    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("/api/v2/login"));
    expect(loginCalls).toHaveLength(1);
    expect(httpProxy.mock.calls[6][1].headers.Cookie).toBe("TPOMADA_SESSIONID=sid");
  });

  it("does not reuse a cached session across different widget identities", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t1" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid1; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t2" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid2; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    await omadaProxyHandler({ query: { group: "g1", service: "svc", index: "0" } }, createMockRes());
    await omadaProxyHandler({ query: { group: "g2", service: "svc", index: "0" } }, createMockRes());

    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("/api/v2/login"));
    expect(loginCalls).toHaveLength(2);
    expect(httpProxy.mock.calls[2][1].headers.Cookie).toBe("TPOMADA_SESSIONID=sid1");
    expect(httpProxy.mock.calls[7][1].headers.Cookie).toBe("TPOMADA_SESSIONID=sid2");
  });

  it("keeps the latest value when Omada sets the same cookie more than once during login", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        {
          "set-cookie": [
            "TPOMADA_SESSIONID=deleteMe; Path=/; Max-Age=0",
            "TPOMADA_SESSIONID=sid; Path=/; HttpOnly",
            "rememberMe=deleteMe; Path=/; Max-Age=0",
          ],
        },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(httpProxy.mock.calls[2][1].headers.Cookie).toBe("TPOMADA_SESSIONID=sid; rememberMe=deleteMe");
    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 2,
        activeUser: 10,
        alerts: 4,
        connectedGateways: 1,
        connectedSwitches: 3,
      }),
    );
  });

  it("does not reuse a mutated content-length header on later GET requests", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    const responses = [
      [200, "application/json", JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } })],
      [
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "t" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=sid; Path=/; HttpOnly"] },
      ],
      [
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ],
      [
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ],
      [200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })],
    ];

    httpProxy.mockImplementation(async (_url, params = {}) => {
      if (params.body) {
        params.headers["content-length"] = Buffer.byteLength(params.body);
      }

      return responses.shift();
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(httpProxy.mock.calls[2][1].headers["content-length"]).toBe(2);
    expect(httpProxy.mock.calls[3][1].headers["content-length"]).toBeUndefined();
    expect(httpProxy.mock.calls[4][1].headers["content-length"]).toBeUndefined();
    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 2,
        activeUser: 10,
        alerts: 4,
        connectedGateways: 1,
        connectedSwitches: 3,
      }),
    );
  });

  it("clears the cached session and re-authenticates when an authenticated response is not JSON", async () => {
    cache.put("omadaProxyHandler__session.g.svc.0", {
      token: "stale-token",
      cookieHeader: "TPOMADA_SESSIONID=stale",
    });

    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([200, "text/html", Buffer.from("<!DOCTYPE html>login")])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "fresh-token" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=fresh; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(cache.del).toHaveBeenCalledWith("omadaProxyHandler__session.g.svc.0");
    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("/api/v2/login"));
    expect(loginCalls).toHaveLength(1);
    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 2,
        activeUser: 10,
        alerts: 4,
        connectedGateways: 1,
        connectedSwitches: 3,
      }),
    );
  });

  it("clears the cached session and re-authenticates when a cached session returns a JSON auth error", async () => {
    cache.put("omadaProxyHandler__session.g.svc.0", {
      token: "stale-token",
      cookieHeader: "TPOMADA_SESSIONID=stale",
    });

    getServiceWidget.mockResolvedValue({
      url: "http://omada",
      username: "u",
      password: "p",
      site: "Default",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ result: { omadacId: "cid", controllerVer: "4.5.6" } }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 1, msg: "Login required" })])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ errorCode: 0, result: { token: "fresh-token" } })),
        { "set-cookie": ["TPOMADA_SESSIONID=fresh; Path=/; HttpOnly"] },
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ errorCode: 0, result: { data: [{ name: "Default", key: "sitekey" }] } }),
      ])
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({
          errorCode: 0,
          result: {
            totalClientNum: 10,
            connectedApNum: 2,
            connectedGatewayNum: 1,
            connectedSwitchNum: 3,
          },
        }),
      ])
      .mockResolvedValueOnce([200, "application/json", JSON.stringify({ errorCode: 0, result: { alertNum: 4 } })]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await omadaProxyHandler(req, res);

    expect(cache.del).toHaveBeenCalledWith("omadaProxyHandler__session.g.svc.0");
    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("/api/v2/login"));
    expect(loginCalls).toHaveLength(1);
    expect(res.body).toBe(
      JSON.stringify({
        connectedAp: 2,
        activeUser: 10,
        alerts: 4,
        connectedGateways: 1,
        connectedSwitches: 3,
      }),
    );
  });
});
