import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn(), warn: vi.fn() },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    rpcwidget: {
      api: "{url}/jsonrpc",
      mappings: {
        list: { endpoint: "test.method", params: [1, 2] },
      },
    },
    missingapi: {
      mappings: {
        list: { endpoint: "test.method", params: [1, 2] },
      },
    },
  },
}));

describe("utils/proxy/handlers/jsonrpc sendJsonRpcRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a JSON-RPC request and returns the response", async () => {
    const { sendJsonRpcRequest } = await import("./jsonrpc");
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
    const { sendJsonRpcRequest } = await import("./jsonrpc");
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

  it("prefers Bearer auth when both basic credentials and a key are provided", async () => {
    const { sendJsonRpcRequest } = await import("./jsonrpc");
    httpProxy.mockImplementationOnce(async (_url, params) => {
      const req = JSON.parse(params.body);
      return [
        200,
        "application/json",
        Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { ok: true } })),
      ];
    });

    const [, , data] = await sendJsonRpcRequest("http://rpc", "test.method", null, {
      username: "u",
      password: "p",
      key: "token",
    });

    expect(JSON.parse(data)).toEqual({ ok: true });
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
  });

  it("maps transport/parse failures into a JSON-RPC style error response", async () => {
    const { sendJsonRpcRequest } = await import("./jsonrpc");
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("not-json")]);

    const [status, , data] = await sendJsonRpcRequest("http://rpc", "test.method", null, { key: "token" });

    expect(status).toBe(200);
    expect(JSON.parse(data)).toEqual({
      result: null,
      error: { code: expect.any(Number), message: expect.any(String) },
    });
    expect(logger.debug).toHaveBeenCalled();
  });

  it("normalizes id=null responses so the client can still receive a result", async () => {
    const { sendJsonRpcRequest } = await import("./jsonrpc");
    httpProxy.mockImplementationOnce(async (_url, params) => {
      const req = JSON.parse(params.body);
      expect(req.id).toBe(1);
      return [200, "application/json", Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: null, result: { ok: true } }))];
    });

    const [status, , data] = await sendJsonRpcRequest("http://rpc", "test.method", null, { key: "token" });

    expect(status).toBe(200);
    expect(JSON.parse(data)).toEqual({ ok: true });
  });
});

describe("utils/proxy/handlers/jsonrpc proxy handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up the widget, applies mappings, and returns JSON-RPC data", async () => {
    const { default: jsonrpcProxyHandler } = await import("./jsonrpc");

    getServiceWidget.mockResolvedValue({ type: "rpcwidget", url: "http://rpc", key: "token" });
    httpProxy.mockImplementationOnce(async (_url, params) => {
      const req = JSON.parse(params.body);
      return [
        200,
        "application/json",
        Buffer.from(JSON.stringify({ jsonrpc: "2.0", id: req.id, result: { method: req.method, params: req.params } })),
      ];
    });

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "test.method", index: 0 } };
    const res = createMockRes();

    await jsonrpcProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json).toEqual({ method: "test.method", params: [1, 2] });
  });

  it("returns 403 when the widget does not support API calls", async () => {
    const { default: jsonrpcProxyHandler } = await import("./jsonrpc");

    getServiceWidget.mockResolvedValue({ type: "missingapi", url: "http://rpc" });
    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "test.method", index: 0 } };
    const res = createMockRes();

    await jsonrpcProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
  });

  it("returns 400 for invalid requests without group/service", async () => {
    const { default: jsonrpcProxyHandler } = await import("./jsonrpc");

    const req = { method: "GET", query: { endpoint: "test.method" } };
    const res = createMockRes();

    await jsonrpcProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });
});

describe("utils/proxy/handlers/jsonrpc unexpected errors", () => {
  it("returns 500 when the JSON-RPC client throws a non-JSONRPCErrorException", async () => {
    vi.resetModules();
    vi.doMock("json-rpc-2.0", () => {
      class JSONRPCErrorException extends Error {
        constructor(message, code) {
          super(message);
          this.code = code;
        }
      }

      class JSONRPCClient {
        constructor() {}

        receive() {}

        async request() {
          throw new Error("boom");
        }
      }

      return { JSONRPCClient, JSONRPCErrorException };
    });

    const { sendJsonRpcRequest } = await import("./jsonrpc");
    const [status, , data] = await sendJsonRpcRequest("http://rpc", "test.method", null, { key: "token" });

    expect(status).toBe(500);
    expect(JSON.parse(data)).toEqual({ result: null, error: { code: 2, message: "Error: boom" } });
    expect(logger.warn).toHaveBeenCalled();
  });
});
