import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const cacheKey = "navidromeProxyHandler__session.media.navidrome.0";

function createReq(endpoint, overrides = {}) {
  return {
    query: {
      group: "media",
      service: "navidrome",
      index: "0",
      endpoint,
      ...overrides,
    },
  };
}

function createJwt(payload) {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

describe("widgets/navidrome/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
    cache._reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses widget.username with Subsonic token auth for getNowPlaying", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      username: "alice",
      token: "subsonic-token",
      salt: "subsonic-salt",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ "subsonic-response": { status: "ok", nowPlaying: {} } })),
    ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe(
      "http://nd/rest/getNowPlaying?u=alice&t=subsonic-token&s=subsonic-salt&v=1.16.1&c=homepage&f=json",
    );
    expect(validateWidgetData).toHaveBeenCalledWith(expect.objectContaining({ type: "navidrome" }), "getNowPlaying", {
      "subsonic-response": { status: "ok", nowPlaying: {} },
    });
    expect(res.statusCode).toBe(200);
  });

  it("builds a Subsonic token from widget.password when token credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ "subsonic-response": { status: "ok", nowPlaying: {} } })),
    ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    const url = new URL(httpProxy.mock.calls[0][0]);
    expect(url.searchParams.get("u")).toBe("alice");
    expect(url.searchParams.get("t")).toHaveLength(32);
    expect(url.searchParams.get("s")).toMatch(/^[a-f0-9]{8}$/);
    expect(res.statusCode).toBe(200);
  });

  it("returns a descriptive error when now playing is missing widget.user and widget.username", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      password: "secret",
    });

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe("Navidrome now playing requires widget.user or widget.username.");
  });

  it("returns a descriptive error when now playing credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
    });

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe("Navidrome now playing requires widget.token/widget.salt or widget.password.");
  });

  it("logs in with widget.username and aggregates library totals", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T12:00:00Z"));

    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      username: "alice",
      password: "secret",
    });

    const exp = Math.floor(Date.now() / 1000) + 20 * 60;
    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: createJwt({ exp }) }))])
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

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://nd/auth/login");
    expect(httpProxy.mock.calls[0][1].body).toBe(JSON.stringify({ username: "alice", password: "secret" }));
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://nd/api/library");
    expect(httpProxy.mock.calls[1][1].headers["X-ND-Authorization"]).toBe(`Bearer ${createJwt({ exp })}`);
    expect(cache.put).toHaveBeenCalledWith(cacheKey, createJwt({ exp }), 900000);
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

  it("falls back to the default session TTL when the JWT payload has no exp", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: createJwt({ sub: "a" }) }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify([{ totalSongs: 1, totalAlbums: 2, totalArtists: 3 }])),
      ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(cache.put).toHaveBeenCalledWith(cacheKey, createJwt({ sub: "a" }), 55 * 60 * 1000);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ totalSongs: 1, totalAlbums: 2, totalArtists: 3 });
  });

  it("retries the library request after a 401 with a refreshed token", async () => {
    cache.put(cacheKey, "stale-token");

    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ error: "expired" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "header.!.signature" }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify([{ totalSongs: 9, totalAlbums: 8, totalArtists: 7 }])),
      ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers["X-ND-Authorization"]).toBe("Bearer stale-token");
    expect(httpProxy.mock.calls[2][1].headers["X-ND-Authorization"]).toBe("Bearer header.!.signature");
    expect(cache.put).toHaveBeenLastCalledWith(cacheKey, "header.!.signature", 55 * 60 * 1000);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ totalSongs: 9, totalAlbums: 8, totalArtists: 7 });
  });

  it("returns the retry login error when refreshing the library token fails", async () => {
    cache.put(cacheKey, "stale-token");

    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ error: "expired" }))])
      .mockResolvedValueOnce([
        503,
        "application/json",
        Buffer.from(JSON.stringify({ error: { message: "login down" } })),
      ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ error: { message: "login down" } });
  });

  it("returns a descriptive error when library credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
    });

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe(
      "Navidrome library stats require widget.user or widget.username and widget.password.",
    );
  });

  it("passes through unsuccessful login responses", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([503, "text/plain", Buffer.from("down")]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toBe("down");
    expect(res.headers["Content-Type"]).toBe("text/plain");
  });

  it("returns 500 when login succeeds without a token", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ nope: true }))]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(logger.error).toHaveBeenCalledWith("Invalid Navidrome login response: %s", JSON.stringify({ nope: true }));
    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data received from Navidrome auth/login.");
  });

  it("passes through unsuccessful library responses after login", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "jwt-token" }))])
      .mockResolvedValueOnce([502, "application/json", Buffer.from(JSON.stringify({ error: { message: "down" } }))]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: { message: "down" } });
  });

  it("returns 500 when the library response is not an array", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ token: "jwt-token" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ nope: true }))]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Library"), res);

    expect(logger.error).toHaveBeenCalledWith("Invalid Navidrome library response: %s", JSON.stringify({ nope: true }));
    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data received from Navidrome api/library.");
  });

  it("returns 400 when the proxy request is missing its group or service", async () => {
    const res = createMockRes();

    await navidromeProxyHandler({ query: { endpoint: "getNowPlaying" } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 400 when the Navidrome widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(undefined);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 400 for unsupported Navidrome endpoints", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      password: "secret",
    });

    const res = createMockRes();

    await navidromeProxyHandler(createReq("Nope"), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe("Unsupported Navidrome endpoint 'Nope'.");
  });

  it("sanitizes upstream error URLs before returning them", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      token: "subsonic-token",
      salt: "subsonic-salt",
    });

    httpProxy.mockResolvedValueOnce([
      502,
      "application/json",
      { error: { message: "down", url: "http://nd/rest/getNowPlaying?u=alice&token=secret" } },
    ]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(502);
    expect(res.body.error.url).toBe("http://nd/rest/getNowPlaying?u=alice&token=***");
  });

  it("returns 500 when response validation fails", async () => {
    validateWidgetData.mockReturnValue(false);
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

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: {
        message: "Invalid data",
        data: { "subsonic-response": { status: "ok", nowPlaying: {} } },
      },
    });
  });

  it("ends the response for 204 upstream responses", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://nd",
      user: "alice",
      token: "subsonic-token",
      salt: "subsonic-salt",
    });

    httpProxy.mockResolvedValueOnce([204, "application/json", {}]);

    const res = createMockRes();

    await navidromeProxyHandler(createReq("getNowPlaying"), res);

    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalled();
  });
});
