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
    linkwarden: { api: "{url}/api/v1/{endpoint}" },
    nextcloud: { api: "{url}/ocs/v2.php/apps/serverinfo/api/v1/{endpoint}" },
    truenas: { api: "{url}/api/v2.0/{endpoint}" },
    proxmoxbackupserver: { api: "{url}/api2/json/{endpoint}" },
    checkmk: { api: "{url}/{endpoint}" },
    stocks: { api: "{url}/{endpoint}" },
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

  it("uses basic auth for truenas when key is not provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "truenas", url: "http://nas", username: "u", password: "p" });
    httpProxy.mockResolvedValue([200, "application/json", { ok: true }]);

    const req = { method: "GET", query: { group: "g", service: "s", endpoint: "system/info", index: 0 } };
    const res = createMockRes();

    await credentialedProxyHandler(req, res);

    const [, params] = httpProxy.mock.calls.at(-1);
    expect(params.headers.Authorization).toMatch(/^Basic /);
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
