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

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
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
    crowdsec: {
      api: "{url}/{endpoint}",
      loginURL: "{url}/login",
    },
  },
}));

import crowdsecProxyHandler from "./proxy";

describe("widgets/crowdsec/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in, caches a token, and uses it for requests", async () => {
    getServiceWidget.mockResolvedValue({
      type: "crowdsec",
      url: "http://cs",
      username: "machine",
      password: "pw",
    });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        JSON.stringify({ token: "tok", expire: new Date(Date.now() + 60_000).toISOString() }),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("data")]);

    const req = { query: { group: "g", service: "svc", endpoint: "alerts", index: "0" } };
    const res = createMockRes();

    await crowdsecProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe("Bearer tok");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("data"));
  });

  it("returns 500 if token cannot be obtained", async () => {
    getServiceWidget.mockResolvedValue({ type: "crowdsec", url: "http://cs", username: "machine", password: "pw" });
    httpProxy.mockResolvedValueOnce([200, "application/json", JSON.stringify({ expire: "2099-01-01T00:00:00Z" })]);

    const req = { query: { group: "g", service: "svc", endpoint: "alerts", index: "0" } };
    const res = createMockRes();

    await crowdsecProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to authenticate with Crowdsec" });
  });
});
