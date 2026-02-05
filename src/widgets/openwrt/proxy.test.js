import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { sendJsonRpcRequest, getServiceWidget, logger } = vi.hoisted(() => ({
  sendJsonRpcRequest: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn() },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/proxy/handlers/jsonrpc", () => ({
  sendJsonRpcRequest,
}));
vi.mock("widgets/widgets", () => ({
  default: {
    openwrt: {
      api: "{url}",
    },
  },
}));

import openwrtProxyHandler from "./proxy";

describe("widgets/openwrt/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and retries after an unauthorized response", async () => {
    getServiceWidget.mockResolvedValue({ type: "openwrt", url: "http://openwrt", username: "u", password: "p" });

    sendJsonRpcRequest
      // initial call -> unauthorized
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ error: { code: -32002 } }))])
      // login -> sets ubus token
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([0, { ubus_rpc_session: "sess" }]))])
      // retry system info -> ok
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify([0, { uptime: 1, load: [0, 131072, 0] }])),
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await openwrtProxyHandler(req, res);

    expect(sendJsonRpcRequest).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).cpuLoad).toBe("2.00");
  });
});
