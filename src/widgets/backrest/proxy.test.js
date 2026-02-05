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

vi.mock("widgets/widgets", () => ({
  default: {
    backrest: {
      api: "{url}/v1.Backrest/{endpoint}",
    },
  },
}));

import backrestProxyHandler, { buildResponse } from "./proxy";

describe("backrest proxy buildResponse", () => {
  it("aggregates plan metrics and latest status counts", () => {
    const plans = [
      {
        backupsSuccessLast30days: 3,
        backupsFailed30days: 1,
        bytesAddedLast30days: 1000,
        recentBackups: { status: ["STATUS_SUCCESS"] },
      },
      {
        backupsSuccessLast30days: 2,
        backupsFailed30days: 0,
        bytesAddedLast30days: 500,
        recentBackups: { status: ["STATUS_ERROR"] },
      },
      {
        backupsSuccessLast30days: "not-a-number",
        backupsFailed30days: 4,
        bytesAddedLast30days: 250,
        recentBackups: { status: [] },
      },
    ];

    expect(buildResponse(plans)).toEqual({
      numPlans: 3,
      numSuccess30Days: 5,
      numFailure30Days: 5,
      numSuccessLatest: 1,
      numFailureLatest: 1,
      bytesAdded30Days: 1750,
    });
  });
});

describe("widgets/backrest/proxy handler", () => {
  beforeEach(() => {
    httpProxy.mockReset();
    getServiceWidget.mockReset();
    vi.clearAllMocks();
  });

  it("returns 400 when the query is missing group or service", async () => {
    const req = { query: { service: "svc" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(getServiceWidget).not.toHaveBeenCalled();
  });

  it("returns 400 when the widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = { query: { group: "g", service: "svc", index: "0", endpoint: "GetSummaryDashboard" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("calls the Backrest API with basic auth and returns the aggregated summary", async () => {
    getServiceWidget.mockResolvedValue({
      type: "backrest",
      url: "http://backrest/",
      username: "u",
      password: "p",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(
        JSON.stringify({
          planSummaries: [
            {
              backupsSuccessLast30days: 1,
              backupsFailed30days: 0,
              bytesAddedLast30days: 10,
              recentBackups: { status: [] },
            },
            {
              backupsSuccessLast30days: 0,
              backupsFailed30days: 1,
              bytesAddedLast30days: 5,
              recentBackups: { status: ["STATUS_ERROR"] },
            },
          ],
        }),
      ),
    ]);

    const req = { query: { group: "g", service: "svc", index: "0", endpoint: "GetSummaryDashboard" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://backrest/v1.Backrest/GetSummaryDashboard");
    expect(httpProxy.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: "POST",
        body: "{}",
        headers: expect.objectContaining({
          "content-type": "application/json",
          Authorization: `Basic ${Buffer.from("u:p").toString("base64")}`,
        }),
      }),
    );

    expect(res.headers["Content-Type"]).toBe("application/json");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      numPlans: 2,
      numSuccess30Days: 1,
      numFailure30Days: 1,
      numSuccessLatest: 0,
      numFailureLatest: 1,
      bytesAdded30Days: 15,
    });
  });

  it("returns 500 when Backrest responds non-200", async () => {
    getServiceWidget.mockResolvedValue({ type: "backrest", url: "http://backrest" });
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("nope")]);

    const req = { query: { group: "g", service: "svc", index: "0", endpoint: "GetSummaryDashboard" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Error getting data from Backrest",
          data: expect.any(Buffer),
        }),
      }),
    );
  });

  it("returns 500 when the plans payload is invalid", async () => {
    getServiceWidget.mockResolvedValue({ type: "backrest", url: "http://backrest" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ planSummaries: {} }))]);

    const req = { query: { group: "g", service: "svc", index: "0", endpoint: "GetSummaryDashboard" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Invalid plans data",
        }),
      }),
    );
  });

  it("returns 500 when httpProxy throws", async () => {
    getServiceWidget.mockResolvedValue({ type: "backrest", url: "http://backrest" });
    httpProxy.mockRejectedValueOnce(new Error("boom"));

    const req = { query: { group: "g", service: "svc", index: "0", endpoint: "GetSummaryDashboard" } };
    const res = createMockRes();

    await backrestProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({ error: "Backrest API Error", message: "boom" }));
  });
});
