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
    dockhand: {
      api: "{url}/{endpoint}",
    },
  },
}));

import dockhandProxyHandler from "./proxy";

describe("widgets/dockhand/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries after a 401 by logging in once", async () => {
    getServiceWidget.mockResolvedValue({
      type: "dockhand",
      url: "http://dockhand/",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]) // login
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]); // retry

    const req = { method: "GET", query: { group: "g", service: "svc", endpoint: "api/v1/status", index: "0" } };
    const res = createMockRes();

    await dockhandProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[1][0]).toBe("http://dockhand/api/auth/login");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("returns a sanitized error response for HTTP errors", async () => {
    getServiceWidget.mockResolvedValue({
      type: "dockhand",
      url: "http://dockhand",
    });

    httpProxy.mockResolvedValueOnce([500, "application/json", Buffer.from("boom")]);

    const req = {
      method: "GET",
      query: { group: "g", service: "svc", endpoint: "api/v1/status?token=abc", index: "0" },
    };
    const res = createMockRes();

    await dockhandProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("HTTP Error");
    expect(res.body.error.url).toContain("token=***");
  });
});
