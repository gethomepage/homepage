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
    bookorbit: {
      api: "{url}/{endpoint}",
    },
  },
}));

import bookorbitProxyHandler from "./proxy";

describe("widgets/bookorbit/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when Bookorbit credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "bookorbit", url: "http://bookorbit" });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing Bookorbit credentials" });
  });

  it("logs in and summarizes libraries and book statuses", async () => {
    getServiceWidget.mockResolvedValue({
      type: "bookorbit",
      url: "http://bookorbit",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ accessToken: "tok" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([{ id: 1 }, { id: 2 }]))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ trackedBooks: 4, startedBooks: 1, completedBooks: 2 }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      libraries: 2,
      books: 4,
      reading: 1,
      finished: 2,
    });
  });
});
