import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
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
    jackett: {
      api: "{url}/{endpoint}",
      loginURL: "{url}/UI/Dashboard",
    },
  },
}));

import jackettProxyHandler from "./proxy";

describe("widgets/jackett/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches an auth cookie when password is set and passes it on requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "jackett",
      url: "http://jackett",
      password: "pw",
    });

    httpProxy
      // login cookie fetch
      .mockResolvedValueOnce([200, "text/plain", null, null, { headers: { Cookie: "c=1" } }])
      // api call
      .mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v2.0/indexers/all/results", index: "0" } };
    const res = createMockRes();

    await jackettProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[1][1].headers.Cookie).toBe("c=1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("ok"));
  });

  it("returns 500 when cookie authentication fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "jackett",
      url: "http://jackett",
      password: "pw",
    });

    httpProxy.mockResolvedValueOnce([200, "text/plain", null, null, { headers: {} }]);

    const req = { query: { group: "g", service: "svc", endpoint: "api", index: "0" } };
    const res = createMockRes();

    await jackettProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to authenticate with Jackett" });
  });
});
