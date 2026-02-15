import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, validateWidgetData, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  validateWidgetData: vi.fn(() => true),
  logger: { debug: vi.fn(), error: vi.fn() },
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
    komodo: {
      api: "{url}/{endpoint}",
      mappings: {
        stats: { body: { hello: "world" } },
      },
    },
  },
}));

import komodoProxyHandler from "./proxy";

describe("widgets/komodo/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
  });

  it("POSTs to the unified read endpoint with API key/secret", async () => {
    getServiceWidget.mockResolvedValue({ type: "komodo", url: "http://komodo", key: "k", secret: "s" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await komodoProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][0]).toBe("http://komodo/read");
    expect(httpProxy.mock.calls[0][1].headers["X-API-Key"]).toBe("k");
    expect(httpProxy.mock.calls[0][1].headers["X-API-Secret"]).toBe("s");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("ok"));
  });

  it("returns 500 when data validation fails", async () => {
    validateWidgetData.mockReturnValue(false);
    getServiceWidget.mockResolvedValue({ type: "komodo", url: "http://komodo", key: "k", secret: "s" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("bad")]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await komodoProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data");
  });
});
