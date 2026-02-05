import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { sendJsonRpcRequest, getServiceWidget, logger } = vi.hoisted(() => ({
  sendJsonRpcRequest: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
  },
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
    deluge: {
      api: "{url}",
    },
  },
}));

import delugeProxyHandler from "./proxy";

describe("widgets/deluge/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and retries the update call after an auth error", async () => {
    getServiceWidget.mockResolvedValue({ type: "deluge", url: "http://deluge", password: "pw" });

    sendJsonRpcRequest
      // update_ui -> error code 1 => 403
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ error: { code: 1 } }))])
      // auth.login -> ok
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ result: true }))])
      // update_ui retry -> ok
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ result: { torrents: {} } }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await delugeProxyHandler(req, res);

    expect(sendJsonRpcRequest).toHaveBeenCalledTimes(3);
    expect(sendJsonRpcRequest.mock.calls[0][1]).toBe("web.update_ui");
    expect(sendJsonRpcRequest.mock.calls[1][1]).toBe("auth.login");
    expect(sendJsonRpcRequest.mock.calls[2][1]).toBe("web.update_ui");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from(JSON.stringify({ result: { torrents: {} } })));
  });
});
