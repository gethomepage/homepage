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
    watchtower: {
      api: "{url}/{endpoint}",
    },
  },
}));

import watchtowerProxyHandler from "./proxy";

describe("widgets/watchtower/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses watchtower metrics and returns a key/value object", async () => {
    getServiceWidget.mockResolvedValue({ type: "watchtower", url: "http://watch", key: "k" });
    httpProxy.mockResolvedValueOnce([
      200,
      "text/plain",
      Buffer.from("watchtower_running 1\nfoo 2\nwatchtower_status 3\n"),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "metrics", index: "0" } };
    const res = createMockRes();

    await watchtowerProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://watch/metrics");
    expect(httpProxy.mock.calls[0][1]).toEqual({
      method: "GET",
      headers: { Authorization: "Bearer k" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ watchtower_running: "1", watchtower_status: "3" });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
  });
});
