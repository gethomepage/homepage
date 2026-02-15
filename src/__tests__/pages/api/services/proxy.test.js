import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getServiceWidget, calendarProxy } = vi.hoisted(() => ({
  state: {
    genericResult: { ok: true },
  },
  getServiceWidget: vi.fn(),
  calendarProxy: vi.fn(),
}));

vi.mock("utils/logger", () => ({
  default: () => ({ debug: vi.fn(), error: vi.fn() }),
}));

vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));

const handlerFn = vi.hoisted(() => ({ handler: vi.fn() }));
vi.mock("utils/proxy/handlers/generic", () => ({ default: handlerFn.handler }));

// Calendar proxy is only used for an exception; keep it stubbed.
vi.mock("widgets/calendar/proxy", () => ({ default: calendarProxy }));

// Provide a minimal widget registry for mapping tests.
vi.mock("widgets/widgets", () => ({
  default: {
    linkwarden: {
      api: "{url}/api/v1/{endpoint}",
      mappings: {
        collections: { endpoint: "collections" },
      },
    },
    segments: {
      api: "{url}/{endpoint}",
      mappings: {
        item: { endpoint: "items/{id}", segments: ["id"] },
      },
    },
    queryparams: {
      api: "{url}/{endpoint}",
      mappings: {
        list: { endpoint: "list", params: ["limit"], optionalParams: ["q"] },
      },
    },
    endpointproxy: {
      api: "{url}/{endpoint}",
      mappings: {
        list: { endpoint: "list", proxyHandler: handlerFn.handler, headers: { "X-Test": "1" } },
      },
    },
    regex: {
      api: "{url}/{endpoint}",
      allowedEndpoints: /^ok\//,
    },
    ical: {
      api: "{url}/{endpoint}",
      proxyHandler: calendarProxy,
    },
    unifi_console: {
      api: "{url}/{endpoint}",
      proxyHandler: handlerFn.handler,
    },
  },
}));

import servicesProxy from "pages/api/services/proxy";

function createMockRes() {
  const res = {
    statusCode: undefined,
    body: undefined,
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
    setHeader: vi.fn(),
  };
  return res;
}

describe("pages/api/services/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps opaque endpoints using widget.mappings and calls the handler", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden" });
    handlerFn.handler.mockImplementation(async (req, res) => res.status(200).json({ endpoint: req.query.endpoint }));

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "collections" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(handlerFn.handler).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ endpoint: "collections" });
  });

  it("returns 403 for unsupported endpoint mapping", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden" });

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "nope" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Unsupported service endpoint" });
  });

  it("returns 403 for unknown widget types", async () => {
    getServiceWidget.mockResolvedValue({ type: "does_not_exist" });

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "collections" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Unknown proxy service type" });
  });

  it("quick-returns the proxy handler when no endpoint is provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden" });
    handlerFn.handler.mockImplementation(async (_req, res) => res.status(200).json(state.genericResult));

    const req = { method: "GET", query: { group: "g", service: "s", index: "0" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(handlerFn.handler).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("applies the calendar exception and always delegates to calendarProxyHandler", async () => {
    getServiceWidget.mockResolvedValue({ type: "calendar" });
    calendarProxy.mockImplementation(async (_req, res) => res.status(200).json({ ok: "calendar" }));

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "events" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(calendarProxy).toHaveBeenCalledTimes(1);
    expect(handlerFn.handler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: "calendar" });
  });

  it("applies the unifi_console exception when service and group are unifi_console", async () => {
    getServiceWidget.mockResolvedValue({ type: "something_else" });
    handlerFn.handler.mockImplementation(async (_req, res) => res.status(200).json({ ok: "unifi" }));

    const req = {
      method: "GET",
      query: { group: "unifi_console", service: "unifi_console", index: "0" },
    };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: "unifi" });
  });

  it("rejects unsupported mapping methods", async () => {
    getServiceWidget.mockResolvedValue({ type: "linkwarden" });

    // Inject a mapping with a method requirement through the mocked registry.
    const widgets = (await import("widgets/widgets")).default;
    const originalMethod = widgets.linkwarden.mappings.collections.method;
    widgets.linkwarden.mappings.collections.method = "POST";

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "collections" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Unsupported method" });

    widgets.linkwarden.mappings.collections.method = originalMethod;
  });

  it("replaces endpoint segments and rejects unsupported segment keys/values", async () => {
    getServiceWidget.mockResolvedValue({ type: "segments" });
    handlerFn.handler.mockImplementation(async (req, res) => res.status(200).json({ endpoint: req.query.endpoint }));

    const res1 = createMockRes();
    await servicesProxy(
      {
        method: "GET",
        query: { group: "g", service: "s", index: "0", endpoint: "item", segments: JSON.stringify({ id: "123" }) },
      },
      res1,
    );
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toEqual({ endpoint: "items/123" });

    const res2 = createMockRes();
    await servicesProxy(
      {
        method: "GET",
        query: { group: "g", service: "s", index: "0", endpoint: "item", segments: JSON.stringify({ nope: "123" }) },
      },
      res2,
    );
    expect(res2.statusCode).toBe(403);
    expect(res2.body).toEqual({ error: "Unsupported segment" });

    const res3 = createMockRes();
    await servicesProxy(
      {
        method: "GET",
        query: { group: "g", service: "s", index: "0", endpoint: "item", segments: JSON.stringify({ id: "../123" }) },
      },
      res3,
    );
    expect(res3.statusCode).toBe(403);
    expect(res3.body).toEqual({ error: "Unsupported segment" });
  });

  it("adds query params based on mapping params + optionalParams", async () => {
    getServiceWidget.mockResolvedValue({ type: "queryparams" });
    handlerFn.handler.mockImplementation(async (req, res) => res.status(200).json({ endpoint: req.query.endpoint }));

    const req = {
      method: "GET",
      query: {
        group: "g",
        service: "s",
        index: "0",
        endpoint: "list",
        query: JSON.stringify({ limit: 10, q: "test" }),
      },
    };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.endpoint).toBe("list?limit=10&q=test");
  });

  it("passes mapping headers via req.extraHeaders and uses mapping.proxyHandler when provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "endpointproxy" });
    handlerFn.handler.mockImplementation(async (req, res) =>
      res.status(200).json({ headers: req.extraHeaders ?? null }),
    );

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "list" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(handlerFn.handler).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.headers).toEqual({ "X-Test": "1" });
  });

  it("allows regex endpoints when widget.allowedEndpoints matches", async () => {
    getServiceWidget.mockResolvedValue({ type: "regex" });
    handlerFn.handler.mockImplementation(async (_req, res) => res.status(200).json({ ok: true }));

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "ok/test" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(200);
  });

  it("rejects unmapped proxy requests when no mapping and regex does not match", async () => {
    getServiceWidget.mockResolvedValue({ type: "regex" });

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "nope" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Unmapped proxy request." });
  });

  it("falls back to the service proxy handler when mapping.proxyHandler is not a function", async () => {
    getServiceWidget.mockResolvedValue({ type: "mapbroken" });
    handlerFn.handler.mockImplementation(async (req, res) => res.status(200).json({ endpoint: req.query.endpoint }));

    const widgets = (await import("widgets/widgets")).default;
    widgets.mapbroken = {
      api: "{url}/{endpoint}",
      mappings: {
        x: { endpoint: "ok", proxyHandler: "nope" },
      },
    };

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "x" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(handlerFn.handler).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.endpoint).toBe("ok");
  });

  it("returns 403 when a widget defines a non-function proxyHandler", async () => {
    getServiceWidget.mockResolvedValue({ type: "brokenhandler" });

    const widgets = (await import("widgets/widgets")).default;
    widgets.brokenhandler = {
      api: "{url}/{endpoint}",
      proxyHandler: "nope",
    };

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "any" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Unknown proxy service type" });
  });

  it("returns 500 on unexpected errors", async () => {
    getServiceWidget.mockRejectedValueOnce(new Error("boom"));

    const req = { method: "GET", query: { group: "g", service: "s", index: "0", endpoint: "collections" } };
    const res = createMockRes();

    await servicesProxy(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Unexpected error" });
  });
});
