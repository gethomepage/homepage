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
});
