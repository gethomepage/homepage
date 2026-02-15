import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, xml2json, logger } = vi.hoisted(() => {
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
    xml2json: vi.fn((xml) => {
      if (xml === "login") {
        return JSON.stringify({ QDocRoot: { authSid: { _cdata: "sid1" } } });
      }
      if (xml === "system") {
        return JSON.stringify({
          QDocRoot: {
            authPassed: { _cdata: "1" },
            func: { ownContent: { root: { cpu: 1 } } },
          },
        });
      }
      if (xml === "volume") {
        return JSON.stringify({ QDocRoot: { authPassed: { _cdata: "1" }, volume: { ok: true } } });
      }
      return JSON.stringify({ QDocRoot: { authPassed: { _cdata: "1" } } });
    }),
    logger: { debug: vi.fn(), error: vi.fn() },
  };
});

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
}));
vi.mock("xml-js", () => ({
  xml2json,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import qnapProxyHandler from "./proxy";

describe("widgets/qnap/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("logs in and returns system + volume data", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://qnap", username: "u", password: "p" });

    httpProxy
      // login
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("login")])
      // system
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("system")])
      // volume
      .mockResolvedValueOnce([200, "application/xml", Buffer.from("volume")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await qnapProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.system).toEqual({ cpu: 1 });
    expect(res.body.volume).toEqual(expect.objectContaining({ authPassed: { _cdata: "1" } }));
  });
});
