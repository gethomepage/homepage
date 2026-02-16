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
    filebrowser: {
      api: "{url}/{endpoint}",
    },
  },
}));

import filebrowserProxyHandler from "./proxy";

describe("widgets/filebrowser/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and uses X-AUTH token for subsequent requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "filebrowser",
      url: "http://fb",
      username: "u",
      password: "p",
      authHeader: "X-User",
    });

    httpProxy
      .mockResolvedValueOnce([200, "text/plain", "token123"])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/raw", index: "0" } };
    const res = createMockRes();

    await filebrowserProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://fb/login");
    expect(httpProxy.mock.calls[0][1].headers).toEqual({ "X-User": "u" });
    expect(httpProxy.mock.calls[1][1].headers["X-AUTH"]).toBe("token123");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("returns 500 when login fails", async () => {
    getServiceWidget.mockResolvedValue({ type: "filebrowser", url: "http://fb", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([401, "text/plain", "nope"]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/raw", index: "0" } };
    const res = createMockRes();

    await filebrowserProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to authenticate with Filebrowser" });
  });
});
