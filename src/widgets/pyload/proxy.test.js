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
      error: vi.fn(),
      info: vi.fn(),
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
    pyload: {
      api: "{url}/api/{endpoint}",
    },
  },
}));

import pyloadProxyHandler from "./proxy";

describe("widgets/pyload/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("uses Basic auth when credentials work and returns data", async () => {
    getServiceWidget.mockResolvedValue({
      type: "pyload",
      url: "http://pyload",
      username: "u",
      password: "p",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ ok: true })), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "status", index: "0" } };
    const res = createMockRes();

    await pyloadProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
    expect(cache.put).toHaveBeenCalledWith("pyloadProxyHandler__isNg.svc", true);
    expect(res.body).toEqual({ ok: true });
  });

  it("retries after 403 by clearing session and logging in again", async () => {
    getServiceWidget.mockResolvedValue({
      type: "pyload",
      url: "http://pyload",
      username: "u",
      password: "",
    });

    httpProxy
      // login -> sessionId
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify("sid1")), {}])
      // fetch -> unauthorized
      .mockResolvedValueOnce([403, "application/json", Buffer.from(JSON.stringify({ error: "bad" })), {}])
      // relogin -> sessionId
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify("sid2")), {}])
      // retry fetch -> ok
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ ok: true })), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "status", index: "0" } };
    const res = createMockRes();

    await pyloadProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(cache.del).toHaveBeenCalledWith("pyloadProxyHandler__sessionId.svc");
    expect(res.body).toEqual({ ok: true });
  });
});
