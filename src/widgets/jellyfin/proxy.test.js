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
    jellyfin: {
      api: "{url}/{endpoint}",
    },
  },
}));

import jellyfinProxyHandler from "./proxy";

describe("widgets/jellyfin/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
  });

  it("adds MediaBrowser auth header and applies an optional mapping function", async () => {
    getServiceWidget.mockResolvedValue({
      type: "jellyfin",
      url: "http://jf",
      key: "abc",
      service_group: "mygroup",
      service_name: "myservice",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", { items: [1] }]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "Users", index: "0" } };
    const res = createMockRes();

    await jellyfinProxyHandler(req, res, () => ({ mapped: true }));

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://jf/Users");
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe(
      'MediaBrowser Token="abc", Client="Homepage", Device="Homepage", DeviceId="mygroup-myservice", Version="1.0.0"',
    );
    expect(validateWidgetData).toHaveBeenCalledWith(expect.objectContaining({ type: "jellyfin" }), "Users", {
      items: [1],
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ mapped: true });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
  });

  it("returns 500 when data validation fails", async () => {
    validateWidgetData.mockReturnValue(false);
    getServiceWidget.mockResolvedValue({ type: "jellyfin", url: "http://jf", key: "abc" });
    httpProxy.mockResolvedValueOnce([200, "application/json", { nope: true }]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "Users", index: "0" } };
    const res = createMockRes();

    await jellyfinProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data");
  });

  it("ends the response for 204 responses", async () => {
    getServiceWidget.mockResolvedValue({ type: "jellyfin", url: "http://jf", key: "abc" });
    httpProxy.mockResolvedValueOnce([204, "application/json", {}]);

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "Users", index: "0" } };
    const res = createMockRes();

    await jellyfinProxyHandler(req, res);

    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalled();
  });
});
