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
    leafwiki: {
      api: "{url}/api/{endpoint}",
      mappings: {
        tree: { endpoint: "tree" },
      },
    },
  },
}));

import leafwikiProxyHandler from "./proxy";

describe("widgets/leafwiki/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  const treeWithPages = JSON.stringify({
    id: "root",
    kind: "section",
    children: [
      { id: "1", kind: "page", children: null },
      { id: "2", kind: "page", children: null },
      {
        id: "3",
        kind: "section",
        children: [{ id: "4", kind: "page", children: null }],
      },
    ],
  });

  it("logs in, fetches tree, and returns computed counts", async () => {
    getServiceWidget.mockResolvedValue({
      type: "leafwiki",
      url: "http://leafwiki",
      username: "admin",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from("")]) // login
      .mockResolvedValueOnce([200, "application/json", Buffer.from(treeWithPages)]); // tree

    const req = { query: { group: "g", service: "svc", endpoint: "tree", index: "0" } };
    const res = createMockRes();

    await leafwikiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://leafwiki/api/auth/login");
    expect(JSON.parse(httpProxy.mock.calls[0][1].body)).toEqual({ identifier: "admin", password: "secret" });
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://leafwiki/api/tree");
    expect(cache.put).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ pages: 3 });
  });

  it("skips login when session is already cached", async () => {
    cache.put("leafwikiProxyHandler__authenticated.svc", true);

    getServiceWidget.mockResolvedValue({
      type: "leafwiki",
      url: "http://leafwiki",
      username: "admin",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(treeWithPages)]);

    const req = { query: { group: "g", service: "svc", endpoint: "tree", index: "0" } };
    const res = createMockRes();

    await leafwikiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://leafwiki/api/tree");
    expect(res.json).toHaveBeenCalledWith({ pages: 3 });
  });

  it("re-logs in and retries on 401", async () => {
    cache.put("leafwikiProxyHandler__authenticated.svc", true);

    getServiceWidget.mockResolvedValue({
      type: "leafwiki",
      url: "http://leafwiki",
      username: "admin",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from("")]) // initial tree fails
      .mockResolvedValueOnce([200, "application/json", Buffer.from("")]) // re-login
      .mockResolvedValueOnce([200, "application/json", Buffer.from(treeWithPages)]); // retry

    const req = { query: { group: "g", service: "svc", endpoint: "tree", index: "0" } };
    const res = createMockRes();

    await leafwikiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[1][0]).toBe("http://leafwiki/api/auth/login");
    expect(cache.del).toHaveBeenCalledWith("leafwikiProxyHandler__authenticated.svc");
    expect(res.json).toHaveBeenCalledWith({ pages: 3 });
  });

  it("works without credentials for public wikis", async () => {
    getServiceWidget.mockResolvedValue({
      type: "leafwiki",
      url: "http://leafwiki",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(treeWithPages)]);

    const req = { query: { group: "g", service: "svc", endpoint: "tree", index: "0" } };
    const res = createMockRes();

    await leafwikiProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://leafwiki/api/tree");
    expect(res.json).toHaveBeenCalledWith({ pages: 3 });
  });
});
