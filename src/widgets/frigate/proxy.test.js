import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cookieJar, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  cookieJar: {
    addCookieToJar: vi.fn(),
  },
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
vi.mock("utils/proxy/cookie-jar", () => cookieJar);
vi.mock("widgets/widgets", () => ({
  default: {
    frigate: {
      api: "{url}/api/{endpoint}",
    },
  },
}));

import frigateProxyHandler from "./proxy";

describe("widgets/frigate/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in after a 401 and returns derived stats", async () => {
    getServiceWidget.mockResolvedValue({
      type: "frigate",
      url: "http://frigate",
      username: "u",
      password: "p",
    });

    httpProxy
      // initial request
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      // login
      .mockResolvedValueOnce([200, "application/json", Buffer.from("{}"), { "set-cookie": ["sid=1"] }])
      // retry stats
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ cameras: { a: {}, b: {} }, service: { uptime: 123, version: "1.0" } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ num_cameras: 2, uptime: 123, version: "1.0" });
  });
});
