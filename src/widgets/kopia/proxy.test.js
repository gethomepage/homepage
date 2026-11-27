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
    kopia: {
      api: "{url}/{endpoint}",
    },
  },
}));

import kopiaProxyHandler from "./proxy";

const UI_HTML = '<html><head><meta name="kopia-csrf-token" content="csrf-token-1" /></head></html>';
const SESSION_COOKIE = "Kopia-Session-Cookie=session-1; Path=/; HttpOnly; SameSite=Strict";
const BASIC_AUTH = `Basic ${Buffer.from("u:p").toString("base64")}`;

function mockWidget() {
  getServiceWidget.mockResolvedValue({
    type: "kopia",
    url: "http://kopia:51515",
    username: "u",
    password: "p",
  });
}

describe("widgets/kopia/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("fetches the UI for a CSRF token and session cookie, then calls the API with both", async () => {
    mockWidget();

    httpProxy
      .mockResolvedValueOnce([200, "text/html", Buffer.from(UI_HTML), { "set-cookie": SESSION_COOKIE }])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ sources: [] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/sources", index: "0" } };
    const res = createMockRes();

    await kopiaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://kopia:51515/");
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe(BASIC_AUTH);
    expect(httpProxy.mock.calls[1][0].toString()).toBe("http://kopia:51515/api/v1/sources");
    expect(httpProxy.mock.calls[1][1]).toEqual({
      method: "GET",
      headers: {
        Authorization: BASIC_AUTH,
        Cookie: "Kopia-Session-Cookie=session-1",
        "X-Kopia-Csrf-Token": "csrf-token-1",
      },
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify({ sources: [] })));
  });

  it("reuses a cached session on subsequent requests", async () => {
    mockWidget();
    cache.put("kopiaProxyHandler__session.svc", {
      cookie: "Kopia-Session-Cookie=cached",
      csrfToken: "cached-token",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ sources: [1] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/sources", index: "0" } };
    const res = createMockRes();

    await kopiaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][1].headers).toEqual({
      Authorization: BASIC_AUTH,
      Cookie: "Kopia-Session-Cookie=cached",
      "X-Kopia-Csrf-Token": "cached-token",
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify({ sources: [1] })));
  });

  it("repeats the CSRF handshake after a 401 and retries the API call", async () => {
    mockWidget();
    cache.put("kopiaProxyHandler__session.svc", {
      cookie: "Kopia-Session-Cookie=stale",
      csrfToken: "stale-token",
    });

    httpProxy
      .mockResolvedValueOnce([401, "text/plain", Buffer.from("Invalid or missing CSRF token.\n")])
      .mockResolvedValueOnce([
        200,
        "text/html",
        Buffer.from('<html><head><meta name="kopia-csrf-token" content="fresh-token" /></head></html>'),
        { "set-cookie": "Kopia-Session-Cookie=fresh-session; Path=/" },
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ sources: [] }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/sources", index: "0" } };
    const res = createMockRes();

    await kopiaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[1][0]).toBe("http://kopia:51515/");
    expect(httpProxy.mock.calls[2][1].headers["X-Kopia-Csrf-Token"]).toBe("fresh-token");
    expect(httpProxy.mock.calls[2][1].headers.Cookie).toBe("Kopia-Session-Cookie=fresh-session");
    expect(res.send).toHaveBeenCalledWith(Buffer.from(JSON.stringify({ sources: [] })));
  });

  it("returns an error when the UI page has no CSRF token", async () => {
    mockWidget();

    httpProxy.mockResolvedValueOnce([
      200,
      "text/html",
      Buffer.from("<html><head></head></html>"),
      { "set-cookie": SESSION_COOKIE },
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "api/v1/sources", index: "0" } };
    const res = createMockRes();

    await kopiaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Kopia UI response did not include a session cookie and CSRF token");
  });
});
