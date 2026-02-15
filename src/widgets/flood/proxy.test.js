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

import floodProxyHandler from "./proxy";

describe("widgets/flood/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and retries after a 401 response", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://flood" });
    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await floodProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://flood/api/stats");
    expect(httpProxy.mock.calls[1][0]).toBe("http://flood/api/auth/authenticate");
    expect(httpProxy.mock.calls[1][1].body).toBeNull();
    expect(httpProxy.mock.calls[2][0].toString()).toBe("http://flood/api/stats");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("returns the login error status when authentication fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://flood", username: "u", password: "p" });
    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([500, "application/json", Buffer.from("bad")]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await floodProxyHandler(req, res);

    expect(httpProxy.mock.calls[1][1].body).toBe(JSON.stringify({ username: "u", password: "p" }));
    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith(Buffer.from("bad"));
  });
});
