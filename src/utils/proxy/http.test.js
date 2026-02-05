import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, cache, logger, dns, net, cookieJar } = vi.hoisted(() => ({
  state: {
    response: {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: Buffer.from(""),
    },
    error: null,
    lastAgentOptions: null,
    lastRequestParams: null,
    lastWrittenBody: null,
  },
  cache: {
    get: vi.fn(),
    put: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
  dns: {
    lookup: vi.fn(),
    resolve4: vi.fn(),
    resolve6: vi.fn(),
  },
  net: {
    isIP: vi.fn(),
  },
  cookieJar: {
    addCookieToJar: vi.fn(),
    setCookieHeader: vi.fn(),
  },
}));

vi.mock("node:dns", () => ({
  default: dns,
}));

vi.mock("node:net", () => ({
  default: net,
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
      state.lastRequestParams = params;
      state.lastWrittenBody = null;
      req.write = vi.fn((chunk) => {
        state.lastWrittenBody = chunk;
      });
      req.end = vi.fn(() => {
        state.lastAgentOptions = params?.agent?.opts ?? null;
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

vi.mock("./cookie-jar", () => cookieJar);

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
    state.lastAgentOptions = null;
    state.lastRequestParams = null;
    state.lastWrittenBody = null;
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

describe("utils/proxy/http homepageDNSLookupFn", () => {
  const getLookupFn = async () => {
    const httpMod = await import("./http");
    await httpMod.httpProxy("http://example.com");
    expect(state.lastAgentOptions?.lookup).toEqual(expect.any(Function));
    return state.lastAgentOptions.lookup;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    state.error = null;
    state.lastAgentOptions = null;
    net.isIP.mockReturnValue(0);
    dns.lookup.mockImplementation((hostname, options, cb) => cb(null, "127.0.0.1", 4));
    dns.resolve4.mockImplementation((hostname, cb) => cb(null, ["127.0.0.1"]));
    dns.resolve6.mockImplementation((hostname, cb) => cb(null, ["::1"]));
    vi.resetModules();
  });

  it("short-circuits when hostname is already an IP (all=false)", async () => {
    const lookup = await getLookupFn();
    net.isIP.mockReturnValueOnce(4);
    const cb = vi.fn();

    lookup("1.2.3.4", cb);

    expect(dns.lookup).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, "1.2.3.4", 4);
  });

  it("short-circuits when hostname is already an IP (all=true)", async () => {
    const lookup = await getLookupFn();
    net.isIP.mockReturnValueOnce(6);
    const cb = vi.fn();

    lookup("::1", { all: true }, cb);

    expect(dns.lookup).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, [{ address: "::1", family: 6 }]);
  });

  it("uses dns.lookup when it succeeds (2-argument form)", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(null, "10.0.0.1", 4));
    lookup("example.com", cb);

    expect(dns.lookup).toHaveBeenCalledWith("example.com", {}, expect.any(Function));
    expect(dns.resolve4).not.toHaveBeenCalled();
    expect(dns.resolve6).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, "10.0.0.1", 4);
  });

  it("does not fall back for non-ENOTFOUND/EAI_NONAME lookup errors", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const err = Object.assign(new Error("temporary"), { code: "EAI_AGAIN" });
    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(err));

    lookup("example.com", { all: true }, cb);

    expect(dns.resolve4).not.toHaveBeenCalled();
    expect(dns.resolve6).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(err);
  });

  it("falls back to resolve4 when lookup fails with ENOTFOUND and family=4", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const lookupErr = Object.assign(new Error("not found"), { code: "ENOTFOUND" });

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(lookupErr));
    dns.resolve4.mockImplementationOnce((hostname, resolveCb) => resolveCb(null, ["1.1.1.1"]));

    lookup("example.com", { family: 4, all: true }, cb);

    expect(dns.resolve4).toHaveBeenCalledWith("example.com", expect.any(Function));
    expect(dns.resolve6).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, [{ address: "1.1.1.1", family: 4 }]);
    expect(logger.debug).toHaveBeenCalledWith("DNS fallback to c-ares resolver succeeded for %s", "example.com");
  });

  it("falls back to resolve6 when lookup fails with ENOTFOUND and family=6", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const lookupErr = Object.assign(new Error("not found"), { code: "ENOTFOUND" });

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(lookupErr));
    dns.resolve6.mockImplementationOnce((hostname, resolveCb) => resolveCb(null, ["::1"]));

    lookup("example.com", 6, cb);

    expect(dns.lookup).toHaveBeenCalledWith("example.com", { family: 6 }, expect.any(Function));
    expect(dns.resolve4).not.toHaveBeenCalled();
    expect(dns.resolve6).toHaveBeenCalledWith("example.com", expect.any(Function));
    expect(cb).toHaveBeenCalledWith(null, ["::1"], 6);
  });

  it("tries resolve4 then resolve6 when lookup fails and no family is specified", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const lookupErr = Object.assign(new Error("not found"), { code: "ENOTFOUND" });

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(lookupErr));
    dns.resolve4.mockImplementationOnce((hostname, resolveCb) =>
      resolveCb(Object.assign(new Error("v4 failed"), { code: "EAI_FAIL" })),
    );
    dns.resolve6.mockImplementationOnce((hostname, resolveCb) => resolveCb(null, ["::1"]));

    lookup("example.com", { all: true }, cb);

    expect(dns.resolve4).toHaveBeenCalledWith("example.com", expect.any(Function));
    expect(dns.resolve6).toHaveBeenCalledWith("example.com", expect.any(Function));
    expect(cb).toHaveBeenCalledWith(null, [{ address: "::1", family: 6 }]);
  });

  it("returns ENOTFOUND when fallback resolver returns no addresses", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const lookupErr = Object.assign(new Error("not found"), { code: "ENOTFOUND" });

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(lookupErr));
    dns.resolve4.mockImplementationOnce((hostname, resolveCb) => resolveCb(null, []));

    lookup("example.com", { family: 4, all: true }, cb);

    const err = cb.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("ENOTFOUND");
    expect(dns.resolve6).not.toHaveBeenCalled();
  });

  it("returns resolve error when fallback resolver fails", async () => {
    const lookup = await getLookupFn();
    const cb = vi.fn();
    const lookupErr = Object.assign(new Error("not found"), { code: "ENOTFOUND" });
    const resolveErr = Object.assign(new Error("resolver down"), { code: "EAI_FAIL" });

    dns.lookup.mockImplementationOnce((hostname, options, lookupCb) => lookupCb(lookupErr));
    dns.resolve4.mockImplementationOnce((hostname, resolveCb) => resolveCb(resolveErr));

    lookup("example.com", { family: 4, all: true }, cb);

    expect(cb).toHaveBeenCalledWith(resolveErr);
    expect(logger.debug).toHaveBeenCalledWith(
      "DNS fallback failed for %s: lookup error=%s, resolve error=%s",
      "example.com",
      "ENOTFOUND",
      "EAI_FAIL",
    );
  });
});

describe("utils/proxy/http httpProxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.error = null;
    state.response = {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: Buffer.from("ok"),
    };
    state.lastAgentOptions = null;
    state.lastRequestParams = null;
    state.lastWrittenBody = null;
    process.env.HOMEPAGE_PROXY_DISABLE_IPV6 = "";
    vi.resetModules();
  });

  it("sets content-length and writes request bodies", async () => {
    const httpMod = await import("./http");
    const body = "abc";

    const [status] = await httpMod.httpProxy("http://example.com", { method: "POST", body, headers: {} });

    expect(status).toBe(200);
    expect(state.lastRequestParams.headers["content-length"]).toBe(3);
    expect(state.lastWrittenBody).toBe(body);
  });

  it("installs a beforeRedirect hook and updates the cookie jar", async () => {
    const httpMod = await import("./http");
    await httpMod.httpProxy("http://example.com");

    expect(state.lastRequestParams.beforeRedirect).toEqual(expect.any(Function));
    expect(cookieJar.setCookieHeader).toHaveBeenCalled();
    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
  });

  it("updates cookies during redirects via beforeRedirect", async () => {
    const httpMod = await import("./http");
    await httpMod.httpProxy("http://example.com");

    state.lastRequestParams.beforeRedirect(
      { href: "http://example.com/redirect" },
      { headers: { "set-cookie": ["a=b"] } },
    );

    expect(cookieJar.addCookieToJar).toHaveBeenCalledWith("http://example.com/redirect", { "set-cookie": ["a=b"] });
    expect(cookieJar.setCookieHeader).toHaveBeenCalledWith("http://example.com/redirect", expect.any(Object));
  });

  it("supports gzip-compressed responses", async () => {
    const { gzipSync } = await import("node:zlib");
    state.response.headers["content-encoding"] = "gzip";
    state.response.body = gzipSync(Buffer.from("hello"));

    const httpMod = await import("./http");
    const [, , data] = await httpMod.httpProxy("http://example.com");

    expect(Buffer.from(data).toString()).toBe("hello");
  });

  it("logs when gzip decoding emits an error", async () => {
    const { PassThrough } = await import("node:stream");

    vi.doMock("node:zlib", async () => {
      const actual = await vi.importActual("node:zlib");
      return {
        ...actual,
        createUnzip: () => {
          const pt = new PassThrough();
          pt.on("pipe", () => {
            queueMicrotask(() => {
              pt.emit("error", new Error("bad gzip"));
              pt.end();
            });
          });
          return pt;
        },
      };
    });

    vi.resetModules();
    const httpMod = await import("./http");

    state.response.headers["content-encoding"] = "gzip";
    state.response.body = Buffer.from("hello");

    await httpMod.httpProxy("http://example.com");

    expect(logger.error).toHaveBeenCalled();

    vi.unmock("node:zlib");
  });

  it("applies strict IPv4 agent options when HOMEPAGE_PROXY_DISABLE_IPV6 is true", async () => {
    process.env.HOMEPAGE_PROXY_DISABLE_IPV6 = "true";
    const httpMod = await import("./http");

    await httpMod.httpProxy("http://example.com");

    expect(state.lastAgentOptions.family).toBe(4);
    expect(state.lastAgentOptions.autoSelectFamily).toBe(false);
  });

  it("uses the https agent with rejectUnauthorized=false for https:// URLs", async () => {
    const httpMod = await import("./http");

    await httpMod.httpProxy("https://example.com");

    expect(state.lastAgentOptions.rejectUnauthorized).toBe(false);
  });

  it("returns a sanitized error response when the request fails", async () => {
    state.error = Object.assign(new Error("boom"), { code: "EHOSTUNREACH" });
    const httpMod = await import("./http");

    const [status, contentType, data] = await httpMod.httpProxy("http://example.com/?apikey=secret");

    expect(status).toBe(500);
    expect(contentType).toBe("application/json");
    expect(data.error.message).toBe("boom");
    expect(data.error.url).toContain("apikey=***");
  });
});
