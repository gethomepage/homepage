import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServiceWidget, genericProxyHandler, httpProxy } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
  genericProxyHandler: vi.fn(),
  httpProxy: vi.fn(),
}));

vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/logger", () => ({ default: () => ({ debug: vi.fn(), error: vi.fn() }) }));
vi.mock("utils/proxy/handlers/generic", () => ({ default: genericProxyHandler }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("widgets/widgets", () => ({
  default: {
    navidrome: {
      api: "{url}/rest/{endpoint}?u={user}&t={token}&s={salt}&v=1.16.1&c=homepage&f=json",
    },
  },
}));

import navidromeProxyHandler from "./proxy";

function createMockRes() {
  const res = {
    statusCode: undefined,
    body: undefined,
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body) => {
      res.body = body;
      return res;
    }),
    send: vi.fn((body) => {
      res.body = body;
      return res;
    }),
  };
  return res;
}

function jsonResponse(payload) {
  return [200, "application/json", Buffer.from(JSON.stringify(payload))];
}

describe("navidrome proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "http://navidrome.test",
      user: "user",
      token: "token",
      salt: "salt",
    });
  });

  it("delegates non-library endpoints to the generic proxy handler", async () => {
    const req = { query: { endpoint: "getNowPlaying" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(genericProxyHandler).toHaveBeenCalledWith(req, res, undefined);
  });

  it("rejects library stats requests without group or service", async () => {
    const req = { query: { endpoint: "libraryStats", group: "g" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(getServiceWidget).not.toHaveBeenCalled();
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("rejects services that do not resolve to a supported widget API", async () => {
    getServiceWidget.mockResolvedValueOnce(undefined);
    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("rejects services with an unsupported widget type", async () => {
    getServiceWidget.mockResolvedValueOnce({ type: "unsupported" });
    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("aggregates library stats from Subsonic-compatible responses", async () => {
    httpProxy
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            indexes: {
              index: [{ artist: [{ id: "1" }, { id: "2" }] }, { artist: [{ id: "3" }] }],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: [{ id: "a" }, { id: "b" }],
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 12 } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            playlists: {
              playlist: [{ id: "p1" }, { id: "p2" }],
            },
          },
        }),
      );

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 3, albums: 2, songs: 12, playlists: 2 });
    expect(httpProxy).toHaveBeenCalledTimes(4);
    expect(httpProxy.mock.calls[1][0].pathname).toBe("/rest/getAlbumList2");
    expect(httpProxy.mock.calls[1][0].searchParams.get("type")).toBe("alphabeticalByName");
    expect(httpProxy.mock.calls[1][0].searchParams.get("size")).toBe("500");
    expect(httpProxy.mock.calls[1][0].searchParams.get("offset")).toBe("0");
    expect(httpProxy.mock.calls[2][0].pathname).toBe("/rest/getScanStatus");
    expect(httpProxy.mock.calls[3][0].pathname).toBe("/rest/getPlaylists");
  });

  it("aggregates library stats from already-parsed JSON responses", async () => {
    httpProxy
      .mockResolvedValueOnce([200, "application/json", { indexes: { index: [{ artist: [{ id: "1" }] }] } }])
      .mockResolvedValueOnce([200, "application/json", { albumList2: { album: [{ id: "a" }] } }])
      .mockResolvedValueOnce([200, "application/json", { scanStatus: { count: 2 } }])
      .mockResolvedValueOnce([200, "application/json", { playlists: { playlist: [{ id: "p1" }] } }]);

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 1, albums: 1, songs: 2, playlists: 1 });
  });

  it("treats empty library payloads as zero counts", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: {} } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { albumList2: {} } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 0 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: {} } }));

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 0, albums: 0, songs: 0, playlists: 0 });
  });

  it("aggregates album stats across multiple album pages", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: { index: [] } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: Array.from({ length: 500 }, (_, index) => ({ id: `album-${index}` })),
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 502 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: { playlist: [] } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: [{ id: "album-500" }],
            },
          },
        }),
      );

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 0, albums: 501, songs: 502, playlists: 0 });
    expect(httpProxy.mock.calls[1][0].searchParams.get("offset")).toBe("0");
    expect(httpProxy.mock.calls[4][0].searchParams.get("offset")).toBe("500");
  });

  it("normalizes singleton Subsonic response objects", async () => {
    httpProxy
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            indexes: {
              index: { artist: { id: "1" } },
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: { id: "a" },
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 5 } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            playlists: {
              playlist: { id: "p1" },
            },
          },
        }),
      );

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 1, albums: 1, songs: 5, playlists: 1 });
  });

  it("returns a placeholder song count when scan status count is missing", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: { index: [] } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { albumList2: { album: [{ id: "a" }] } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: {} } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: { playlist: [] } } }));

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 0, albums: 1, songs: null, playlists: 0 });
  });

  it("returns a sanitized Subsonic error when every upstream call reports one", async () => {
    httpProxy
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            error: { code: 40, message: "Wrong username or password" },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            error: { code: 40, message: "Wrong username or password" },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            error: { code: 40, message: "Wrong username or password" },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            error: { code: 40, message: "Wrong username or password" },
          },
        }),
      );

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error.data).toEqual({ code: 40, message: "Wrong username or password" });
    expect(res.body.error.url).toContain("t=***");
    expect(res.body.error.url).toContain("u=***");
    expect(res.body.error.url).toContain("s=***");
  });

  it("returns partial stats when album pagination does not advance", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: { index: [] } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: Array.from({ length: 500 }, (_, index) => ({ id: `album-${index}` })),
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 0 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: { playlist: [] } } }))
      .mockResolvedValueOnce(
        jsonResponse({
          "subsonic-response": {
            albumList2: {
              album: Array.from({ length: 500 }, (_, index) => ({ id: `album-${index}` })),
            },
          },
        }),
      );

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 0, albums: null, songs: 0, playlists: 0 });
  });

  it("returns partial stats when one upstream call fails", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: { index: [{ artist: [{ id: "1" }] }] } } }))
      .mockResolvedValueOnce([500, "application/json", Buffer.from(JSON.stringify({ error: "boom" }))])
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 2 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: { playlist: [{ id: "p1" }] } } }));

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 1, albums: null, songs: 2, playlists: 1 });
  });

  it("returns partial stats when one upstream call throws", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: { index: [{ artist: [{ id: "1" }] }] } } }))
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 2 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: { playlist: [{ id: "p1" }] } } }));

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artists: 1, albums: null, songs: 2, playlists: 1 });
  });

  it("returns an error when every upstream stats call fails", async () => {
    httpProxy
      .mockResolvedValueOnce([500, "application/json", Buffer.from(JSON.stringify({ error: "a" }))])
      .mockResolvedValueOnce([500, "application/json", Buffer.from(JSON.stringify({ error: "b" }))])
      .mockResolvedValueOnce([500, "application/json", Buffer.from(JSON.stringify({ error: "c" }))])
      .mockResolvedValueOnce([500, "application/json", Buffer.from(JSON.stringify({ error: "d" }))]);

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.url).toContain("t=***");
    expect(res.body.error.url).toContain("u=***");
    expect(res.body.error.url).toContain("s=***");
    expect(res.body.error.url).not.toContain("user");
    expect(res.body.error.url).not.toContain("token");
    expect(res.body.error.url).not.toContain("salt");
  });

  it("returns an unexpected error when writing the stats response throws", async () => {
    httpProxy
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { indexes: {} } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { albumList2: {} } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { scanStatus: { count: 0 } } }))
      .mockResolvedValueOnce(jsonResponse({ "subsonic-response": { playlists: {} } }));

    const req = { query: { group: "g", service: "s", index: "0", endpoint: "libraryStats" } };
    const res = createMockRes();
    res.status.mockImplementationOnce(() => {
      throw new Error("response unavailable");
    });

    await navidromeProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "Unexpected error" } });
    expect(httpProxy).toHaveBeenCalledTimes(4);
  });
});
