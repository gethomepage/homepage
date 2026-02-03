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
});
