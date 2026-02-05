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

import qbittorrentProxyHandler from "./proxy";

describe("widgets/qbittorrent/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and retries after a 403 response", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://qb", username: "u", password: "p" });

    httpProxy
      .mockResolvedValueOnce([403, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("Ok.")])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "torrents/info", index: "0" } };
    const res = createMockRes();

    await qbittorrentProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[1][0]).toBe("http://qb/api/v2/auth/login");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("returns 401 when login succeeds but response body is not Ok.", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://qb", username: "u", password: "p" });

    httpProxy
      .mockResolvedValueOnce([403, "application/json", Buffer.from("nope")])
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("Denied")]);

    const req = { query: { group: "g", service: "svc", endpoint: "torrents/info", index: "0" } };
    const res = createMockRes();

    await qbittorrentProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(Buffer.from("Denied"));
  });
});
