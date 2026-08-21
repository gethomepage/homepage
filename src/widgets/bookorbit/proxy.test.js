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
      api: "{url}/api/v1/{endpoint}",
    },
  },
}));

import bookorbitProxyHandler from "./proxy";

const widget = {
  type: "bookorbit",
  url: "http://bookorbit",
  username: "u",
  password: "p",
};

// BookOrbit signs short lived access tokens; the payload's `exp` drives how long the
// proxy caches one.
function accessToken(expiresInSeconds, name = "tok") {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })).toString(
    "base64url",
  );
  return `header.${payload}.${name}`;
}

function json(body, status = 200) {
  return [status, "application/json", Buffer.from(JSON.stringify(body))];
}

const libraries = [
  { id: 1, name: "eBooks" },
  { id: 2, name: "Audiobooks" },
];
const overview = { totalBooks: 42, totalAuthors: 8, totalSeries: 3 };
const summary = { trackedBooks: 12, startedBooks: 10, inProgressBooks: 3, completedBooks: 7 };

describe("widgets/bookorbit/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when BookOrbit credentials are missing", async () => {
    getServiceWidget.mockResolvedValue({ type: "bookorbit", url: "http://bookorbit" });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Missing BookOrbit credentials" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("logs in once and summarizes libraries, books and reading status", async () => {
    getServiceWidget.mockResolvedValue(widget);

    const token = accessToken(15 * 60);

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: token }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json(overview))
      .mockResolvedValueOnce(json(summary));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(4);

    const [loginUrl, loginOptions] = httpProxy.mock.calls[0];
    expect(loginUrl.toString()).toBe("http://bookorbit/api/v1/auth/login");
    expect(loginOptions.method).toBe("POST");
    expect(JSON.parse(loginOptions.body)).toEqual({ username: "u", password: "p" });

    expect(httpProxy.mock.calls.slice(1).map(([url]) => url.toString())).toEqual([
      "http://bookorbit/api/v1/libraries",
      "http://bookorbit/api/v1/dashboard/widgets/library-overview",
      "http://bookorbit/api/v1/user-statistics/summary",
    ]);
    expect(httpProxy.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${token}`);

    // The token is cached ahead of its expiry so the next refresh skips the login call.
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][2]).toBeLessThan(15 * 60 * 1000);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      libraries: 2,
      books: 42,
      reading: 3,
      finished: 7,
    });
  });

  it("logs in again and retries when a cached token is rejected", async () => {
    getServiceWidget.mockResolvedValue(widget);
    cache.put("bookorbitProxyHandler__sessionToken.svc", "stale-token");

    const token = accessToken(15 * 60, "fresh");
    const responses = [
      json({ error: "Unauthorized" }, 401),
      json({ accessToken: token }),
      json(libraries),
      json(overview),
      json(summary),
    ];

    // The retry reuses the same headers object, so each Authorization header is
    // recorded as it is sent rather than read back off the mock afterwards.
    const sent = [];
    httpProxy.mockImplementation(async (url, options) => {
      sent.push({ url: url.toString(), authorization: options.headers?.Authorization });
      return responses.shift();
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(sent[0]).toEqual({
      url: "http://bookorbit/api/v1/libraries",
      authorization: "Bearer stale-token",
    });
    expect(sent[1].url).toBe("http://bookorbit/api/v1/auth/login");
    expect(sent[2]).toEqual({
      url: "http://bookorbit/api/v1/libraries",
      authorization: `Bearer ${token}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      libraries: 2,
      books: 42,
      reading: 3,
      finished: 7,
    });
  });

  it("passes an upstream failure through", async () => {
    getServiceWidget.mockResolvedValue(widget);

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json({ message: "Internal Server Error" }, 500));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Error fetching libraries" });
  });

  it("scopes the counts to the configured libraries and labels a single one", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: ["audiobooks"] });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json({ totalBooks: 20, formatCounts: { mp3: 14 } }))
      .mockResolvedValueOnce(json({ inProgressBooks: 1, completedBooks: 5 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    // The library overview is skipped; per-library stats are counted instead.
    expect(httpProxy.mock.calls.slice(2).map(([url]) => url.toString())).toEqual([
      "http://bookorbit/api/v1/libraries/2/stats",
      "http://bookorbit/api/v1/user-statistics/summary?libraryIds=2",
    ]);

    expect(res.body).toEqual({
      libraries: 1,
      books: 20,
      reading: 1,
      finished: 5,
      mediaKind: "audiobook",
    });
  });

  it("sums several configured libraries and leaves the label alone", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: "eBooks, 2" });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json({ totalBooks: 19 }))
      .mockResolvedValueOnce(json({ totalBooks: 20 }))
      .mockResolvedValueOnce(json({ inProgressBooks: 2, completedBooks: 0 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy.mock.calls[4][0].toString()).toBe(
      "http://bookorbit/api/v1/user-statistics/summary?libraryIds=1&libraryIds=2",
    );
    expect(res.body).toEqual({
      libraries: 2,
      books: 39,
      reading: 2,
      finished: 0,
      libraryName: undefined,
    });
  });

  it("returns 404 when no library matches the configured names", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: ["Magazines"] });

    httpProxy.mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) })).mockResolvedValueOnce(json(libraries));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "No matching BookOrbit libraries" });
  });
  it("treats `all` as no filter", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: "all" });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json(overview))
      .mockResolvedValueOnce(json(summary));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(httpProxy.mock.calls[2][0].toString()).toBe("http://bookorbit/api/v1/dashboard/widgets/library-overview");
    expect(httpProxy.mock.calls[3][0].toString()).toBe("http://bookorbit/api/v1/user-statistics/summary");
    expect(res.body.libraries).toBe(2);
    expect(res.body.books).toBe(42);
  });

  it("classifies a library from its own file formats", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: ["Audiobooks"] });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      // One stray epub does not stop a library of audiobooks being audio.
      .mockResolvedValueOnce(json({ totalBooks: 20, formatCounts: { mp3: 14, m4b: 4, m4a: 1, epub: 1 } }))
      .mockResolvedValueOnce(json({ inProgressBooks: 1, completedBooks: 0 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.body.mediaKind).toBe("audiobook");
    expect(res.body.label).toBeUndefined();
  });

  it("leaves the media kind unset when the selection is mixed", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: ["eBooks", "Audiobooks"] });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json({ totalBooks: 19, formatCounts: { epub: 14, pdf: 5 } }))
      .mockResolvedValueOnce(json({ totalBooks: 20, formatCounts: { mp3: 19 } }))
      .mockResolvedValueOnce(json({ inProgressBooks: 2, completedBooks: 0 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.body.mediaKind).toBeUndefined();
    expect(res.body.books).toBe(39);
  });
  it("lets a configured label override the library name", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, libraries: ["Audiobooks"], label: "Listening room" });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json({ totalBooks: 20, formatCounts: { mp3: 19 } }))
      .mockResolvedValueOnce(json({ inProgressBooks: 1, completedBooks: 0 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.body.label).toBe("Listening room");
    expect(res.body.mediaKind).toBe("audiobook");
  });

  it("labels an unnamed selection with the override too", async () => {
    getServiceWidget.mockResolvedValue({ ...widget, label: "Everything" });

    httpProxy
      .mockResolvedValueOnce(json({ accessToken: accessToken(15 * 60) }))
      .mockResolvedValueOnce(json(libraries))
      .mockResolvedValueOnce(json(overview))
      .mockResolvedValueOnce(json(summary));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await bookorbitProxyHandler(req, res);

    expect(res.body.label).toBe("Everything");
    expect(res.body.libraries).toBe(2);
  });
});
