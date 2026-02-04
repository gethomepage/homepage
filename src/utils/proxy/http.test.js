import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, cache, logger } = vi.hoisted(() => ({
  state: {
    response: {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: Buffer.from(""),
    },
    error: null,
  },
  cache: {
    get: vi.fn(),
    put: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("follow-redirects", async () => {
  const { EventEmitter } = await import("node:events");
  const { Readable } = await import("node:stream");

  function Agent(opts) {
    this.opts = opts;
  }

  function makeRequest() {
    return (url, params, cb) => {
      const req = new EventEmitter();
      req.write = vi.fn();
      req.end = vi.fn(() => {
        if (state.error) {
          req.emit("error", state.error);
          return;
        }

        const res = new Readable({
          read() {
            this.push(state.response.body);
            this.push(null);
          },
        });
        res.statusCode = state.response.statusCode;
        res.headers = state.response.headers;
        cb(res);
      });
      return req;
    };
  }

  return {
    http: { request: makeRequest(), Agent },
    https: { request: makeRequest(), Agent },
  };
});

vi.mock("memory-cache", () => ({
  default: cache,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

describe("utils/proxy/http cachedRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.error = null;
    state.response = {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: Buffer.from(""),
    };
    vi.resetModules();
  });

  it("returns cached values without calling httpProxy", async () => {
    cache.get.mockReturnValueOnce({ ok: true });
    const httpMod = await import("./http");
    const spy = vi.spyOn(httpMod, "httpProxy");

    const data = await httpMod.cachedRequest("http://example.com");

    expect(data).toEqual({ ok: true });
    expect(spy).not.toHaveBeenCalled();
  });

  it("parses json buffer responses and caches the result", async () => {
    cache.get.mockReturnValueOnce(null);
    state.response.body = Buffer.from('{"a":1}');
    const httpMod = await import("./http");

    const data = await httpMod.cachedRequest("http://example.com/data", 1, "ua");

    expect(data).toEqual({ a: 1 });
    expect(cache.put).toHaveBeenCalledWith("http://example.com/data", { a: 1 }, 1 * 1000 * 60);
  });

  it("falls back to string when cachedRequest cannot parse json", async () => {
    cache.get.mockReturnValueOnce(null);
    state.response.body = Buffer.from("not-json");
    const httpMod = await import("./http");

    const data = await httpMod.cachedRequest("http://example.com/data", 1, "ua");

    expect(data).toBe("not-json");
    expect(logger.debug).toHaveBeenCalled();
  });
});
