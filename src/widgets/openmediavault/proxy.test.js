import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cookieJar, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  cookieJar: {
    addCookieToJar: vi.fn(),
    setCookieHeader: vi.fn(),
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
    openmediavault: {
      api: "{url}/rpc.php",
    },
  },
}));

import openmediavaultProxyHandler from "./proxy";

describe("widgets/openmediavault/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in after a 401 and retries the RPC call", async () => {
    getServiceWidget.mockResolvedValue({
      type: "openmediavault",
      url: "http://omv",
      username: "u",
      password: "p",
      method: "foo.bar",
    });

    httpProxy
      // initial rpc unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ response: {} })), {}])
      // login rpc
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ response: { authenticated: true } })),
        { "set-cookie": ["sid=1"] },
      ])
      // retry rpc
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ response: { ok: true } })), {}]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openmediavaultProxyHandler(req, res);

    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from(JSON.stringify({ response: { ok: true } })));
  });
});
