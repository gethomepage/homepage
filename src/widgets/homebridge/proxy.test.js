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
    homebridge: {
      api: "{url}/{endpoint}",
    },
  },
}));

import homebridgeProxyHandler from "./proxy";

describe("widgets/homebridge/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in and aggregates status, versions, plugin updates, and child bridge counts", async () => {
    getServiceWidget.mockResolvedValue({ type: "homebridge", url: "http://hb", username: "u", password: "p" });

    httpProxy
      // login
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ access_token: "tok", expires_in: 3600 })),
        {},
      ])
      // status
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ status: "ok" })), {}])
      // version
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ updateAvailable: true })), {}])
      // child bridges
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify([{ status: "ok" }, { status: "down" }])),
        {},
      ])
      // plugins
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify([{ updateAvailable: true }, { updateAvailable: false }])),
        {},
      ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await homebridgeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      updateAvailable: true,
      plugins: { updatesAvailable: 1 },
      childBridges: { running: 1, total: 2 },
    });
  });
});
