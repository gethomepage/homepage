import { beforeEach, describe, expect, it, vi } from "vitest";

const { httpProxy, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  logger: { debug: vi.fn(), warn: vi.fn() },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import { sendJsonRpcRequest } from "./jsonrpc";

describe("utils/proxy/handlers/jsonrpc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a JSON-RPC request and returns the response", async () => {
    httpProxy.mockImplementationOnce(async (_url, params) => {
      const req = JSON.parse(params.body);
      return [
        200,
        "application/json",
        Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { ok: true } })),
      ];
    });

    const [status, contentType, data] = await sendJsonRpcRequest("http://rpc", "test.method", [1], {
      username: "u",
      password: "p",
    });

    expect(status).toBe(200);
    expect(contentType).toBe("application/json");
    expect(JSON.parse(data)).toEqual({ ok: true });
    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
  });

  it("maps JSON-RPC error responses into a result=null error object", async () => {
    httpProxy.mockImplementationOnce(async (_url, params) => {
      const req = JSON.parse(params.body);
      return [
        200,
        "application/json",
        Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: null, error: { code: 123, message: "bad" } })),
      ];
    });

    const [status, , data] = await sendJsonRpcRequest("http://rpc", "test.method", null, { key: "token" });

    expect(status).toBe(200);
    expect(JSON.parse(data)).toEqual({ result: null, error: { code: 123, message: "bad" } });
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
  });
});
