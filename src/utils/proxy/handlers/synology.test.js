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

  it("returns 400 when group/service are missing", async () => {
    const req = { query: { endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 400 when the widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(false);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 403 when the endpoint is not mapped", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    const req = { query: { group: "g", service: "svc", endpoint: "nope", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
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

  it("caches api info lookups to avoid repeated query calls", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy
      // first call info query
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ data: { "SYNO.DownloadStation2.Task": { path: "entry.cgi", maxVersion: 2 } } })),
      ])
      // first call api
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ success: true }))])
      // second call api only (info should be cached)
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ success: true }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res1 = createMockRes();
    const res2 = createMockRes();

    await synologyProxyHandler(req, res1);
    await synologyProxyHandler(req, res2);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    // second invocation should not re-fetch api info
    expect(httpProxy.mock.calls[2][0]).toContain("/webapi/entry.cgi?api=SYNO.DownloadStation2.Task");
  });

  it("returns non-200 proxy responses as-is (with content-type)", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ data: { "SYNO.DownloadStation2.Task": { path: "entry.cgi", maxVersion: 2 } } })),
      ])
      .mockResolvedValueOnce([503, "text/plain", Buffer.from("nope")]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.headers["Content-Type"]).toBe("text/plain");
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual(Buffer.from("nope"));
  });

  it("returns 400 when the API name is unrecognized", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ data: {} }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Unrecognized API name: SYNO.DownloadStation2.Task" });
  });

  it("logs a warning when API info returns invalid JSON and treats the API name as unrecognized", async () => {
    getServiceWidget.mockResolvedValue({ type: "synology", url: "http://nas", username: "u", password: "p" });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("{not json")]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Unrecognized API name: SYNO.DownloadStation2.Task" });
  });

  it("includes a 2FA hint when authentication fails with a 403+ error code", async () => {
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
      // api call returns success false -> triggers login
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
      // login returns success false with 2fa-required code
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code: 403 } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({ code: 403, error: expect.stringContaining("2FA") }));
  });

  it("handles non-200 login responses and surfaces a synology error code", async () => {
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
      // api call returns success false -> triggers login
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
      // login is non-200 => login() returns early
      .mockResolvedValueOnce([
        503,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code: 103 } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ code: 103, error: "The requested method does not exist." });
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

  it.each([
    [102, "The requested API does not exist."],
    [104, "The requested version does not support the functionality."],
    [105, "The logged in session does not have permission."],
    [107, "Session interrupted by duplicated login."],
    [119, "Invalid session or SID not found."],
  ])("maps synology error code %s to a friendly error", async (code, expected) => {
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
      // api call returns success false -> triggers login
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code } })),
      ])
      // info query for auth api name
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ data: { "SYNO.API.Auth": { path: "auth.cgi", maxVersion: 7 } } })),
      ])
      // login success
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ success: true }))])
      // retry still fails with the same code
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ success: false, error: { code } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "download", index: "0" } };
    const res = createMockRes();

    await synologyProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ code, error: expected });
  });
});
