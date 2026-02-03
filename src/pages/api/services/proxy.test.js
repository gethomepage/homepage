import { describe, expect, it, vi } from "vitest";

const { getServiceWidget } = vi.hoisted(() => ({ getServiceWidget: vi.fn() }));

vi.mock("utils/logger", () => ({
  default: () => ({ debug: vi.fn(), error: vi.fn() }),
}));

vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));

const handlerFn = vi.hoisted(() => ({ handler: vi.fn() }));
vi.mock("utils/proxy/handlers/generic", () => ({ default: handlerFn.handler }));

// Calendar proxy is only used for an exception; keep it stubbed.
vi.mock("widgets/calendar/proxy", () => ({ default: vi.fn() }));

// Provide a minimal widget registry for mapping tests.
vi.mock("widgets/widgets", () => ({
  default: {
    linkwarden: {
      api: "{url}/api/v1/{endpoint}",
      mappings: {
        collections: { endpoint: "collections" },
      },
    },
  },
}));

import servicesProxy from "./proxy";

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
});
