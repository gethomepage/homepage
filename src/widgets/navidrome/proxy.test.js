import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, validateWidgetData, cache, logger } = vi.hoisted(() => {
  const store = new Map();

  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    validateWidgetData: vi.fn(() => true),
    cache: {
      get: vi.fn((key) => store.get(key)),
      put: vi.fn((key, value) => store.set(key, value)),
      del: vi.fn((key) => store.delete(key)),
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

vi.mock("utils/proxy/validate-widget-data", () => ({
  default: validateWidgetData,
}));

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
}));

import navidromeProxyHandler from "./proxy";

describe("widgets/navidrome/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
    cache._reset();
  });

  it("uses Subsonic token auth for getNowPlaying", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      token: "subsonic-token",
      salt: "subsonic-salt",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ "subsonic-response": { status: "ok", nowPlaying: {} } })),
    ]);

    const req = { query: { group: "media", service: "navidrome", endpoint: "getNowPlaying", index: "0" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe(
      "http://nd/rest/getNowPlaying?u=alice&t=subsonic-token&s=subsonic-salt&v=1.16.1&c=homepage&f=json",
    );
    expect(validateWidgetData).toHaveBeenCalledWith(expect.objectContaining({ type: "navidrome" }), "getNowPlaying", {
      "subsonic-response": { status: "ok", nowPlaying: {} },
    });
    expect(res.statusCode).toBe(200);
  });

  it("logs in and aggregates library totals", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "jwt-token" }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify([
            { totalSongs: 100, totalAlbums: 20, totalArtists: 10 },
            { totalSongs: 25, totalAlbums: 5, totalArtists: 3 },
          ]),
        ),
      ]);

    const req = { query: { group: "media", service: "navidrome", endpoint: "Library", index: "0" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://nd/auth/login");
    expect(httpProxy.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    expect(httpProxy.mock.calls[0][1].body).toBe(JSON.stringify({ username: "alice", password: "secret" }));
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://nd/api/library");
    expect(httpProxy.mock.calls[1][1].headers["X-ND-Authorization"]).toBe("Bearer jwt-token");
    expect(validateWidgetData).toHaveBeenCalledWith(expect.objectContaining({ type: "navidrome" }), "Library", {
      totalSongs: 125,
      totalAlbums: 25,
      totalArtists: 13,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      totalSongs: 125,
      totalAlbums: 25,
      totalArtists: 13,
    });
  });
});
