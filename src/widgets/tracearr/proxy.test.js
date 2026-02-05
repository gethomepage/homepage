import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
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
vi.mock("widgets/widgets", () => ({
  default: {
    tracearr: {
      api: "{url}/api/v1/public/{endpoint}",
    },
  },
}));

import tracearrProxyHandler from "./proxy";

describe("widgets/tracearr/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves streams with bearer auth", async () => {
    getServiceWidget.mockResolvedValue({ type: "tracearr", url: "http://tracearr", key: "testkey" });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(
        JSON.stringify({
          data: [{ id: "1", mediaTitle: "Test Movie" }],
          summary: { total: 1 },
        }),
      ),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "streams", index: "0" } };
    const res = createMockRes();

    await tracearrProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer testkey");
    expect(res.statusCode).toBe(200);
  });

  it("returns error when service is missing", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await tracearrProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns error when widget is not found", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = { query: { group: "g", service: "svc", endpoint: "streams", index: "0" } };
    const res = createMockRes();

    await tracearrProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });
});
