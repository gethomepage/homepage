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

vi.mock("utils/logger", () => ({ default: () => logger }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("memory-cache", () => ({ default: cache, ...cache }));
vi.mock("widgets/widgets", () => ({
  default: { bookorbit: { api: "{url}/api/v1/{endpoint}" } },
}));

import bookorbitProxyHandler from "./proxy";

const widget = { type: "bookorbit", url: "http://bookorbit", username: "u", password: "p" };
const req = { query: { group: "g", service: "svc", index: "0" } };

const json = (body, status = 200) => [status, "application/json", Buffer.from(JSON.stringify(body))];
const tokens = (n) => ({ accessToken: `access${n}`, refreshToken: `refresh${n}` });
const summary = { totalBooks: 10, totalAuthors: 4, totalSeries: 2, totalStorageBytes: 2048 };
const userSummary = { inProgressBooks: 1, completedBooks: 3 };

describe("widgets/bookorbit/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "bookorbit", url: "http://bookorbit" });
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing BookOrbit credentials" });
  });

  it("logs in as a native client and combines library and reading stats", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(json(tokens(1)))
      .mockResolvedValueOnce(json(summary))
      .mockResolvedValueOnce(json(userSummary));
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(JSON.parse(httpProxy.mock.calls[0][1].body)).toEqual(
      expect.objectContaining({ username: "u", password: "p", clientKind: "native" }),
    );
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://bookorbit/api/v1/statistics/summary");
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe("Bearer access1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ books: 10, authors: 4, series: 2, storage: 2048, reading: 1, finished: 3 });
  });

  it("reuses the cached access token", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(json(tokens(1)))
      .mockResolvedValueOnce(json(summary))
      .mockResolvedValueOnce(json(userSummary))
      .mockResolvedValueOnce(json(summary))
      .mockResolvedValueOnce(json(userSummary));

    await bookorbitProxyHandler(req, createMockRes());
    await bookorbitProxyHandler(req, createMockRes());

    const loginCalls = httpProxy.mock.calls.filter(([url]) => url.toString().includes("auth/"));
    expect(loginCalls).toHaveLength(1);
  });

  it("uses the refresh token when the access token is rejected", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(json(tokens(1)))
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(tokens(2)))
      .mockResolvedValueOnce(json(summary))
      .mockResolvedValueOnce(json(userSummary));
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy.mock.calls[2][0].toString()).toBe("http://bookorbit/api/v1/auth/refresh");
    expect(JSON.parse(httpProxy.mock.calls[2][1].body)).toEqual({ refreshToken: "refresh1" });
    expect(httpProxy.mock.calls[3][1].headers.Authorization).toBe("Bearer access2");
    expect(res.statusCode).toBe(200);
  });

  it("falls back to logging in when the refresh token is rejected", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy
      .mockResolvedValueOnce(json(tokens(1)))
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json(tokens(3)))
      .mockResolvedValueOnce(json(summary))
      .mockResolvedValueOnce(json(userSummary));
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy.mock.calls[3][0].toString()).toBe("http://bookorbit/api/v1/auth/login");
    expect(httpProxy.mock.calls[4][1].headers.Authorization).toBe("Bearer access3");
    expect(res.statusCode).toBe(200);
  });

  it("returns an error when login fails", async () => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy.mockResolvedValueOnce(json({ message: "Invalid credentials" }, 401));
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
  });
});
