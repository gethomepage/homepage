import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, validateWidgetData, logger, widgets } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  validateWidgetData: vi.fn(() => true),
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
  widgets: {
    archisteamfarm: {
      api: "{url}/Api/{endpoint}",
    },
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

vi.mock("utils/proxy/validate-widget-data", () => ({
  default: validateWidgetData,
}));

vi.mock("widgets/widgets", () => ({
  default: widgets,
}));

import archisteamfarmProxyHandler from "./proxy";

describe("widgets/archisteamfarm/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
    widgets.archisteamfarm.api = "{url}/Api/{endpoint}";
  });

  it("returns 400 when the request is missing a group or service", async () => {
    const res = createMockRes();

    await archisteamfarmProxyHandler({ method: "GET", query: { endpoint: "ASF", index: "0" } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 403 when the resolved widget does not expose an API", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
    });

    widgets.archisteamfarm.api = undefined;

    const res = createMockRes();

    await archisteamfarmProxyHandler(
      { method: "GET", query: { group: "g", service: "svc", endpoint: "ASF", index: "0" } },
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
  });

  it("returns 400 when widget.password is missing", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "   ",
    });

    const res = createMockRes();

    await archisteamfarmProxyHandler(
      { method: "GET", query: { group: "g", service: "svc", endpoint: "ASF", index: "0" } },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: { message: "ArchiSteamFarm widget requires widget.password." } });
  });

  it("adds the ASF authentication header and applies an optional mapping function", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: 123456,
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ Result: { a: {}, b: {} } })),
    ]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "Bot/ASF", index: "0" } };
    const res = createMockRes();

    await archisteamfarmProxyHandler(req, res, () => ({ count: 2 }));

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("https://asf.example.com/Api/Bot/ASF");
    expect(httpProxy.mock.calls[0][1].headers.Authentication).toBe("123456");
    expect(validateWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({ type: "archisteamfarm" }),
      "Bot/ASF",
      expect.any(Buffer),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ count: 2 });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
  });

  it("returns 500 when data validation fails", async () => {
    validateWidgetData.mockReturnValue(false);
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
    });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ nope: true }))]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "ASF", index: "0" } };
    const res = createMockRes();

    await archisteamfarmProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data");
  });

  it("logs upstream HTTP errors and sanitizes the returned URL", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([
      502,
      "application/json",
      { error: { message: "down", url: "https://example.com/raw?token=secret" } },
    ]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "ASF?token=secret", index: "0" } };
    const res = createMockRes();

    await archisteamfarmProxyHandler(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "HTTP Error %d calling %s",
      502,
      "https://asf.example.com/Api/ASF?token=secret",
    );
    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({
      error: {
        message: "down",
        url: "https://asf.example.com/Api/ASF?token=***",
      },
    });
  });

  it("ends the response for 204 responses", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
    });
    httpProxy.mockResolvedValueOnce([204, "application/json", {}]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "ASF", index: "0" } };
    const res = createMockRes();

    await archisteamfarmProxyHandler(req, res);

    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalled();
  });

  it("sets the content type only when one is returned", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
    });
    httpProxy.mockResolvedValueOnce([200, undefined, Buffer.from(JSON.stringify({ Result: { a: {} } }))]);

    const res = createMockRes();

    await archisteamfarmProxyHandler(
      { method: "GET", query: { group: "g", service: "svc", endpoint: "Bot/ASF", index: "0" } },
      res,
    );

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });
});
