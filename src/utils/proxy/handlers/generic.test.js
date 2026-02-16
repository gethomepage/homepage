import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, validateWidgetData, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  validateWidgetData: vi.fn(() => true),
  logger: { debug: vi.fn() },
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
  default: {
    testservice: {
      api: "{url}/{endpoint}",
    },
    customapi: {
      api: "{url}/{endpoint}",
    },
  },
}));

import genericProxyHandler from "./generic";

describe("utils/proxy/handlers/generic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
  });

  it("returns 403 when the service widget type does not define an API mapping", async () => {
    getServiceWidget.mockResolvedValue({
      type: "missing",
      url: "http://example",
    });

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
  });

  it("replaces extra '?' characters in the endpoint with '&'", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "x?a=1?b=2", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://example/x?a=1&b=2");
    expect(res.statusCode).toBe(200);
  });

  it("preserves trailing slash for customapi widgets when widget.url ends with /", async () => {
    getServiceWidget.mockResolvedValue({
      type: "customapi",
      url: "http://example/",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "path", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://example/path/");
  });

  it("uses widget.requestBody as a string when req.body is not provided", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
      method: "POST",
      requestBody: "raw-body",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { method: "POST", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][1].body).toBe("raw-body");
  });

  it("uses requestBody and basic auth headers when provided", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
      method: "POST",
      username: "u",
      password: "p",
      requestBody: { hello: "world" },
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][1].method).toBe("POST");
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
    expect(httpProxy.mock.calls[0][1].body).toBe(JSON.stringify({ hello: "world" }));
  });

  it("sanitizes error urls embedded in successful payloads", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      {
        error: {
          url: "http://upstream.example/?apikey=secret",
        },
      },
    ]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api?apikey=secret", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.url).toContain("apikey=***");
  });

  it("returns an Invalid data error when validation fails", async () => {
    validateWidgetData.mockReturnValue(false);
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", { bad: true }]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.message).toBe("Invalid data");
  });

  it("uses string requestBody as-is and prefers req.body over widget.requestBody", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
      requestBody: '{"a":1}',
    });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = {
      method: "POST",
      body: "override-body",
      query: { group: "g", service: "svc", endpoint: "api", index: "0" },
    };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].body).toBe("override-body");
  });

  it("ends the response for 204/304 statuses", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });
    httpProxy.mockResolvedValueOnce([204, "application/json", Buffer.from("")]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalled();
  });

  it("returns an HTTP Error object for status>=400 and stringifies buffer data", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });
    httpProxy.mockResolvedValueOnce([500, "application/json", Buffer.from("fail")]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api?apikey=secret", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("HTTP Error");
    expect(res.body.error.url).toContain("apikey=***");
    expect(res.body.error.data).toBe("fail");
  });

  it("returns 400 when group/service are missing", async () => {
    const req = { method: "GET", query: { endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(logger.debug).toHaveBeenCalled();
  });

  it("applies the response mapping function when provided", async () => {
    getServiceWidget.mockResolvedValue({
      type: "testservice",
      url: "http://example",
    });
    httpProxy.mockResolvedValueOnce([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await genericProxyHandler(req, res, (data) => ({ mapped: data.ok }));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mapped: true });
  });
});
