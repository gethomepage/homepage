import { describe, expect, it, vi } from "vitest";

const { httpProxy } = vi.hoisted(() => ({ httpProxy: vi.fn() }));
const { validateWidgetData } = vi.hoisted(() => ({ validateWidgetData: vi.fn(() => true) }));
const { getServiceWidget } = vi.hoisted(() => ({ getServiceWidget: vi.fn() }));

vi.mock("utils/logger", () => ({
  default: () => ({
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("utils/proxy/validate-widget-data", () => ({ default: validateWidgetData }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));

// Keep the widget registry minimal so the test doesn't import the whole widget graph.
vi.mock("widgets/widgets", () => ({
  default: {
    linkwarden: { api: "{url}/api/v1/{endpoint}" },
    nextcloud: { api: "{url}/ocs/v2.php/apps/serverinfo/api/v1/{endpoint}" },
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
});
