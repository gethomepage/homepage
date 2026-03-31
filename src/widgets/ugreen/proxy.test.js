import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, logger } = vi.hoisted(() => {
  const store = new Map();

  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => store.get(k)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    ugreen: {
      api: "{url}/{endpoint}",
      mappings: {
        stats: { endpoint: "ugreen/v1/taskmgr/stat/get_all" },
        status: { endpoint: "ugreen/v1/desktop/components/data?id=desktop.component.SystemStatus" },
        storage: { endpoint: "ugreen/v1/storage/pool/list" },
      },
    },
  },
}));

// Mock crypto for RSA operations
vi.mock("crypto", () => ({
  default: {
    createPublicKey: vi.fn(() => "mock-public-key"),
    publicEncrypt: vi.fn(() => Buffer.from("encrypted-password")),
    constants: { RSA_PKCS1_PADDING: 1 },
  },
}));

import ugreenProxyHandler from "./proxy";

describe("widgets/ugreen/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when group or service is missing", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await ugreenProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("performs RSA login flow and uses token for API requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "ugreen",
      url: "http://ugreen",
      username: "admin",
      password: "secret",
    });

    httpProxy
      // Step 1: verify/check returns RSA key
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200 })),
        { "x-rsa-token": Buffer.from("mock-rsa-key").toString("base64") },
      ])
      // Step 2: verify/login returns token
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200, data: { token: "tok123" } })),
      ])
      // Step 3: actual API call
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200, data: { overview: {} } })),
      ]);

    const req = {
      query: { group: "g", service: "svc", endpoint: "ugreen/v1/taskmgr/stat/get_all", index: "0" },
    };
    const res = createMockRes();

    await ugreenProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    // verify/check
    expect(httpProxy.mock.calls[0][0]).toBe("http://ugreen/ugreen/v1/verify/check?token=");
    // verify/login
    expect(httpProxy.mock.calls[1][0]).toBe("http://ugreen/ugreen/v1/verify/login");
    // API call with token
    expect(httpProxy.mock.calls[2][0].toString()).toContain("token=tok123");
    expect(res.json).toHaveBeenCalled();
  });

  it("uses cached token and skips login", async () => {
    cache.put("ugreenProxyHandler__token.svc", "cached-token");

    getServiceWidget.mockResolvedValue({
      type: "ugreen",
      url: "http://ugreen",
      username: "admin",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ code: 200, data: {} })),
    ]);

    const req = {
      query: { group: "g", service: "svc", endpoint: "ugreen/v1/taskmgr/stat/get_all", index: "0" },
    };
    const res = createMockRes();

    await ugreenProxyHandler(req, res);

    // Only the API call, no login
    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("token=cached-token");
  });

  it("re-authenticates when UGOS returns code 1024 (token expired)", async () => {
    cache.put("ugreenProxyHandler__token.svc", "expired-token");

    getServiceWidget.mockResolvedValue({
      type: "ugreen",
      url: "http://ugreen",
      username: "admin",
      password: "secret",
    });

    httpProxy
      // First API call returns code 1024
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 1024 })),
      ])
      // Re-auth: verify/check
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200 })),
        { "x-rsa-token": Buffer.from("mock-rsa-key").toString("base64") },
      ])
      // Re-auth: verify/login
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200, data: { token: "new-token" } })),
      ])
      // Retry API call
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ code: 200, data: { overview: {} } })),
      ]);

    const req = {
      query: { group: "g", service: "svc", endpoint: "ugreen/v1/taskmgr/stat/get_all", index: "0" },
    };
    const res = createMockRes();

    await ugreenProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(cache.del).toHaveBeenCalledWith("ugreenProxyHandler__token.svc");
    expect(res.json).toHaveBeenCalled();
  });
});
