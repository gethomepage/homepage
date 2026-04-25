import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, validateWidgetData, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  validateWidgetData: vi.fn(() => true),
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

vi.mock("utils/proxy/validate-widget-data", () => ({
  default: validateWidgetData,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    archisteamfarm: {
      api: "{url}/Api/{endpoint}",
    },
  },
}));

import archisteamfarmProxyHandler from "./proxy";

describe("widgets/archisteamfarm/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
  });

  it("adds the ASF authentication header and applies an optional mapping function", async () => {
    getServiceWidget.mockResolvedValue({
      type: "archisteamfarm",
      url: "https://asf.example.com",
      password: "secret",
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
    expect(httpProxy.mock.calls[0][1].headers.Authentication).toBe("secret");
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
});
