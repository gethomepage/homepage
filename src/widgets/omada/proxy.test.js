import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import omadaProxyHandler from "./proxy";

describe("widgets/omada/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear one-off implementations between tests (some branches return early).
    httpProxy.mockReset();
    getServiceWidget.mockReset();
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
    expect(res.body.error.message).toBe("Error logging in to Oamda controller");
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

  it("returns 500 with the raw payload when overview stats retrieval fails (v5)", async () => {
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
    expect(res.body).toBe(JSON.stringify({ errorCode: 1, msg: "bad" }));
  });
});
