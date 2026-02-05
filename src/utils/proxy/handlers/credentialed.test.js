import { beforeEach, describe, expect, it, vi } from "vitest";

const { httpProxy } = vi.hoisted(() => ({ httpProxy: vi.fn() }));
const { validateWidgetData } = vi.hoisted(() => ({ validateWidgetData: vi.fn(() => true) }));
const { getServiceWidget } = vi.hoisted(() => ({ getServiceWidget: vi.fn() }));
const { getSettings } = vi.hoisted(() => ({
  getSettings: vi.fn(() => ({ providers: { finnhub: "finnhub-token" } })),
}));

vi.mock("utils/logger", () => ({
  default: () => ({
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("utils/proxy/validate-widget-data", () => ({ default: validateWidgetData }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/config/config", () => ({ getSettings }));

// Keep the widget registry minimal so the test doesn't import the whole widget graph.
vi.mock("widgets/widgets", () => ({
  default: {
    coinmarketcap: { api: "{url}/{endpoint}" },
    gotify: { api: "{url}/{endpoint}" },
    plantit: { api: "{url}/{endpoint}" },
    myspeed: { api: "{url}/{endpoint}" },
    esphome: { api: "{url}/{endpoint}" },
    wgeasy: { api: "{url}/{endpoint}" },
    linkwarden: { api: "{url}/api/v1/{endpoint}" },
    miniflux: { api: "{url}/{endpoint}" },
    nextcloud: { api: "{url}/ocs/v2.php/apps/serverinfo/api/v1/{endpoint}" },
    paperlessngx: { api: "{url}/api/{endpoint}" },
    proxmox: { api: "{url}/api2/json/{endpoint}" },
    truenas: { api: "{url}/api/v2.0/{endpoint}" },
    proxmoxbackupserver: { api: "{url}/api2/json/{endpoint}" },
    checkmk: { api: "{url}/{endpoint}" },
    stocks: { api: "{url}/{endpoint}" },
    speedtest: { api: "{url}/{endpoint}" },
    tubearchivist: { api: "{url}/{endpoint}" },
    autobrr: { api: "{url}/{endpoint}" },
    jellystat: { api: "{url}/{endpoint}" },
    trilium: { api: "{url}/{endpoint}" },
    gitlab: { api: "{url}/{endpoint}" },
    azuredevops: { api: "{url}/{endpoint}" },
    glances: { api: "{url}/{endpoint}" },
    withheaders: { api: "{url}/{endpoint}", headers: { "X-Widget": "1" } },
  },
}));

import credentialedProxyHandler from "./credentialed";

function createMockRes() {
  const res = {
    headers: {},
    statusCode: undefined,
    body: undefined,
    setHeader: (k, v) => {
      res.headers[k] = v;
    },
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.body = data;
      return res;
    },
    send: (data) => {
      res.body = data;
      return res;
    },
    end: () => res,
  };
  return res;
}

describe("utils/proxy/handlers/credentialed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateWidgetData.mockReturnValue(true);
  });

  it("returns 400 when group/service are missing", async () => {
    const req = { method: "GET", query: { endpoint: "e", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 400 when the widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(false);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 403 when the widget type does not support API calls", async () => {
    getServiceWidget.mockResolvedValue({ type: "noapi", url: "http://example", key: "token" });

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
  });

  it("uses Bearer auth for linkwarden widgets", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden", url: "http://example", key: "token" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalled();
    const [, params] = httpProxy.mock.calls[0];
    expect(params.headers.Authorization).toBe("Bearer token");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("uses NC-Token auth for nextcloud widgets when key is provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "nextcloud", url: "http://example", key: "nc-token" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "status", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers["NC-Token"]).toBe("nc-token");
    expect(params.headers.Authorization).toBeUndefined();
  });

  it("uses basic auth for nextcloud when key is not provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "nextcloud", url: "http://example", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "status", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toMatch(/^Basic /);
  });

  it("uses basic auth for truenas when key is not provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "truenas", url: "http://nas", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "system/info", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toMatch(/^Basic /);
  });

  it("uses Bearer auth for truenas when key is provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "truenas", url: "http://nas", key: "k" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "system/info", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toBe("Bearer k");
  });

  it.each([
    [{ type: "paperlessngx", url: "http://x", key: "k" }, { Authorization: "Token k" }],
    [
      { type: "paperlessngx", url: "http://x", username: "u", password: "p" },
      { Authorization: expect.stringMatching(/^Basic /) },
    ],
  ])("sets paperlessngx auth mode for %o", async (widget, expected) => {
    getServiceWidget.mockResolvedValue(widget);
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "documents", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers).toEqual(expect.objectContaining(expected));
  });

  it("uses basic auth for esphome when username/password are provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "esphome", url: "http://x", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "e", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toMatch(/^Basic /);
  });

  it("uses basic auth for wgeasy when username/password are provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "wgeasy", url: "http://x", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "e", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toMatch(/^Basic /);
  });

  it("covers additional auth/header modes for common widgets", async () => {
    const cases = [
      [{ type: "coinmarketcap", url: "http://x", key: "k" }, { "X-CMC_PRO_API_KEY": "k" }],
      [{ type: "gotify", url: "http://x", key: "k" }, { "X-gotify-Key": "k" }],
      [{ type: "plantit", url: "http://x", key: "k" }, { Key: "k" }],
      [{ type: "myspeed", url: "http://x", password: "p" }, { Password: "p" }],
      [{ type: "proxmox", url: "http://x", username: "u", password: "p" }, { Authorization: "PVEAPIToken=u=p" }],
      [{ type: "autobrr", url: "http://x", key: "k" }, { "X-API-Token": "k" }],
      [{ type: "jellystat", url: "http://x", key: "k" }, { "X-API-Token": "k" }],
      [{ type: "tubearchivist", url: "http://x", key: "k" }, { Authorization: "Token k" }],
      [{ type: "miniflux", url: "http://x", key: "k" }, { "X-Auth-Token": "k" }],
      [{ type: "trilium", url: "http://x", key: "k" }, { Authorization: "k" }],
      [{ type: "gitlab", url: "http://x", key: "k" }, { "PRIVATE-TOKEN": "k" }],
      [{ type: "speedtest", url: "http://x", key: "k" }, { Authorization: "Bearer k" }],
      [
        { type: "azuredevops", url: "http://x", key: "k" },
        { Authorization: `Basic ${Buffer.from("$:k").toString("base64")}` },
      ],
      [
        { type: "glances", url: "http://x", username: "u", password: "p" },
        { Authorization: expect.stringMatching(/^Basic /) },
      ],
      [{ type: "wgeasy", url: "http://x", password: "p" }, { Authorization: "p" }],
      [{ type: "esphome", url: "http://x", key: "cookie" }, { Cookie: "authenticated=cookie" }],
    ];

    for (const [widget, expected] of cases) {
      getServiceWidget.mockResolvedValue(widget);
      httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

      const req = { method: "GET", query: { group: "g", service: "s", endpoint: "e", index: 0 } };
      const res = createMockRes();

      await credentialedProxyHandler(req, res);

      const [, params] = httpProxy.mock.calls.at(-1);
      expect(params.headers).toEqual(expect.objectContaining(expected));
    }
  });

  it("merges registry/widget/request headers and falls back to X-API-Key for unknown types", async () => {
    getServiceWidget.mockResolvedValue({
      type: "withheaders",
      url: "http://example",
      key: "k",
      headers: { "X-From-Widget": "2" },
    });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = {
      method: "GET",
      query: { group: "g", service: "s", endpoint: "collections", index: 0 },
      extraHeaders: { "X-From-Req": "3" },
    };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "X-Widget": "1",
        "X-From-Widget": "2",
        "X-From-Req": "3",
        "X-API-Key": "k",
      }),
    );
  });

  it("sets PBSAPIToken auth and removes content-type for proxmoxbackupserver", async () => {
    getServiceWidget.mockResolvedValue({
      type: "proxmoxbackupserver",
      url: "http://pbs",
      username: "u",
      password: "p",
    });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "nodes", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers["Content-Type"]).toBeUndefined();
    expect(params.headers.Authorization).toBe("PBSAPIToken=u:p");
  });

  it("uses checkmk's Bearer username password auth format", async () => {
    getServiceWidget.mockResolvedValue({ type: "checkmk", url: "http://checkmk", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = {
      method: "GET",
      query: { group: "g", service: "s", endpoint: "domain-types/host_config/collections/all", index: 0 },
    };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Accept).toBe("application/json");
    expect(params.headers.Authorization).toBe("Bearer u p");
  });

  it("injects the configured finnhub provider token for stocks widgets", async () => {
    getServiceWidget.mockResolvedValue({ type: "stocks", url: "http://stocks", provider: "finnhub" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "quote", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers["X-Finnhub-Token"]).toBe("finnhub-token");
  });

  it("sanitizes embedded query params when a downstream error contains a url", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden", url: "http://example", key: "token" });
    httpProxy.mockResolvedValue([500, "application/json", { error: { message: "oops", url: "http://bad" } }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections?apikey=secret", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.url).toContain("apikey=***");
  });

  it("ends the response for 204/304 statuses", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden", url: "http://example", key: "token" });
    httpProxy.mockResolvedValue([204, "application/json", Buffer.from("")]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(204);
  });

  it("returns invalid data errors as 500 when validation fails on 200 responses", async () => {
    validateWidgetData.mockReturnValueOnce(false);
    getServiceWidget.mockResolvedValue({ type: "linkwarden", url: "http://example", key: "token" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe("Invalid data");
    expect(res.body.error.url).toContain("http://example/api/v1/collections");
  });

  it("applies the response mapping function when provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden", url: "http://example", key: "token" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true, value: 1 }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "collections", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res, (data) => ({ ok: data.ok, v: data.value }));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, v: 1 });
  });
});
