import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, xml2json, logger } = vi.hoisted(() => {
  const store = new Map();
  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => (store.has(k) ? store.get(k) : null)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    xml2json: vi.fn((xml) => {
      if (xml === "sessions") return JSON.stringify({ MediaContainer: { _attributes: { size: "2" } } });
      if (xml === "libraries")
        return JSON.stringify({
          MediaContainer: {
            Directory: [
              { _attributes: { type: "movie", key: "1" } },
              { _attributes: { type: "show", key: "2" } },
              { _attributes: { type: "artist", key: "3" } },
            ],
          },
        });
      if (xml === "movies") return JSON.stringify({ MediaContainer: { _attributes: { size: "10" } } });
      if (xml === "tv") return JSON.stringify({ MediaContainer: { _attributes: { totalSize: "20" } } });
      if (xml === "albums") return JSON.stringify({ MediaContainer: { _attributes: { size: "30" } } });
      return JSON.stringify({ MediaContainer: { _attributes: { size: "0" } } });
    }),
    logger: { debug: vi.fn(), error: vi.fn() },
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
vi.mock("xml-js", () => ({
  xml2json,
}));
vi.mock("widgets/widgets", () => ({
  default: {
    plex: {
      api: "{url}{endpoint}",
    },
  },
}));

import plexProxyHandler from "./proxy";

describe("widgets/plex/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("fetches sessions and library counts, caching intermediate results", async () => {
    getServiceWidget.mockResolvedValue({ type: "plex", url: "http://plex" });

    httpProxy
      // sessions
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("sessions")])
      // libraries
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("libraries")])
      // movies
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("movies")])
      // tv
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("tv")])
      // albums
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("albums")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await plexProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ streams: "2", albums: 30, movies: 10, tv: 20 });
    expect(cache.put).toHaveBeenCalled();
  });
});
