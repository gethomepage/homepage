import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { cache, httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  cache: {
    get: vi.fn(),
    put: vi.fn(),
  },
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("memory-cache", () => ({
  default: cache,
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
vi.mock("utils/proxy/cookie-jar", () => ({
  addCookieToJar: vi.fn(),
  setCookieHeader: vi.fn(),
}));
vi.mock("widgets/widgets", () => ({
  default: {
    bbox: {
      api: "{url}/api/v1/{endpoint}",
    },
  },
}));

import bboxProxyHandler from "./proxy";

describe("widgets/bbox/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when group or service is missing", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 400 when widget is not found", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = { query: { group: "g", service: "svc" } };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 500 when cookie authentication fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "bbox",
      url: "http://bbox",
      password: "pw",
    });

    httpProxy.mockResolvedValueOnce([200, "text/plain", null, null, { headers: {} }]);

    const req = { query: { group: "g", service: "svc" } };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to authenticate with BBox" });
  });

  it("fetches data successfully with auth", async () => {
    getServiceWidget.mockResolvedValue({
      type: "bbox",
      url: "http://bbox",
      password: "pw",
    });

    const deviceData = JSON.stringify([{ device: { modelname: "Box Model", uptime: 1000 } }]);
    const wanData = JSON.stringify([{ wan: { link: { state: "Up" }, ip: { address: "1.2.3.4" } } }]);
    const hostData = JSON.stringify([{ hosts: { list: ["host1", "host2"] } }]);

    httpProxy
      // login cookie fetch
      .mockResolvedValueOnce([200, "text/plain", null, null, { headers: { Cookie: "c=1" } }])
      // api calls
      .mockResolvedValueOnce([200, "application/json", Buffer.from(deviceData)])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(wanData)])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(hostData)]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "Up",
      modelname: "Box Model",
      uptime: 1000,
      wanIPAddress: "1.2.3.4",
      devices: ["host1", "host2"],
    });
  });

  it("retries fetching token when api returns 401", async () => {
    getServiceWidget.mockResolvedValue({
      type: "bbox",
      url: "http://bbox",
    });

    const deviceData = JSON.stringify([{ device: { modelname: "Box Model", uptime: 1000 } }]);
    const wanData = JSON.stringify([{ wan: { link: { state: "Up" }, ip: { address: "1.2.3.4" } } }]);
    const hostData = JSON.stringify([{ hosts: { list: ["host1", "host2"] } }]);

    const tokenData = JSON.stringify([{ device: { access_token: "new_token", expires_in: 3600 } }]);

    httpProxy
      // device call -> fails 401
      .mockResolvedValueOnce([401, "application/json", Buffer.from("")])
      // getToken call
      .mockResolvedValueOnce([200, "application/json", Buffer.from(tokenData)])
      // retry device call -> succeeds
      .mockResolvedValueOnce([200, "application/json", Buffer.from(deviceData)])
      // wan data call -> succeeds
      .mockResolvedValueOnce([200, "application/json", Buffer.from(wanData)])
      // host data call -> succeeds
      .mockResolvedValueOnce([200, "application/json", Buffer.from(hostData)]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(5);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "Up",
      modelname: "Box Model",
      uptime: 1000,
      wanIPAddress: "1.2.3.4",
      devices: ["host1", "host2"],
    });
  });

  it("handles fetch errors correctly", async () => {
    getServiceWidget.mockResolvedValue({
      type: "bbox",
      url: "http://bbox",
    });

    httpProxy
      // device -> fails
      .mockResolvedValueOnce([500, "text/plain", Buffer.from("error")])
      // wan -> fails
      .mockResolvedValueOnce([500, "text/plain", Buffer.from("error")])
      // host -> fails
      .mockResolvedValueOnce([500, "text/plain", Buffer.from("error")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bboxProxyHandler(req, res);

    // device api call fails
    expect(logger.error).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: undefined,
      modelname: undefined,
      uptime: undefined,
      wanIPAddress: undefined,
      devices: undefined,
    });
  });
});
