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
    logger: { debug: vi.fn(), warn: vi.fn() },
  };
});

vi.mock("memory-cache", () => ({
  default: cache,
  ...cache,
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
vi.mock("widgets/widgets", () => ({
  default: {
    synology: {
      api: "{url}/webapi/{cgiPath}?api={apiName}&version={maxVersion}&method={apiMethod}",
      mappings: {
        download: { apiName: "SYNO.DownloadStation2.Task", apiMethod: "list" },
      },
    },
  },
}));

import synologyProxyHandler from "./synology";

describe("utils/proxy/handlers/synology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("calls the mapped API when api info is available and success is true", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy
      // info query
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ data: { "SYNO.DownloadStation2.Task": { path: "entry.cgi", maxVersion: 2 } } })),
      ])
      // api call
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: true, data: { ok: true } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[1][0]).toContain("/webapi/entry.cgi?api=SYNO.DownloadStation2.Task");
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString()).data.ok).toBe(true);
  });

  it("attempts login and retries when the initial response is unsuccessful", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy
      // info query for mapping api name
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            data: {
              "SYNO.DownloadStation2.Task": { path: "entry.cgi", maxVersion: 2 },
              "SYNO.API.Auth": { path: "auth.cgi", maxVersion: 7 },
            },
          }),
        ),
      ])
      // api call returns success false
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code: 106 } })),
      ])
      // info query for auth api name
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ data: { "SYNO.API.Auth": { path: "auth.cgi", maxVersion: 7 } } })),
      ])
      // login success
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ success: true }))])
      // retry still fails
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code: 106 } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ code: 106, error: "Session timeout." });
  });
});
