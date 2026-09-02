import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceWidget, logger, genericHandler, allowedHandler, mappedHandler, calendarHandler } = vi.hoisted(() => ({
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn(), error: vi.fn() },
  genericHandler: vi.fn(),
  allowedHandler: vi.fn(),
  mappedHandler: vi.fn(),
  calendarHandler: vi.fn(),
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("widgets/calendar/proxy", () => ({
  default: calendarHandler,
}));

vi.mock("widgets/widgets", () => ({
  default: {
    noendpoint: {
      api: "{url}",
      proxyHandler: genericHandler,
    },
    allowed: {
      api: "{url}/api/{endpoint}",
      proxyHandler: allowedHandler,
      allowedEndpoints: /^status$/,
    },
    mapped: {
      api: "{url}/{endpoint}",
      proxyHandler: mappedHandler,
      mappings: {
        Sessions: {
          endpoint: "Sessions",
        },
        Pause: {
          method: "POST",
          endpoint: "Sessions/Playing/Pause",
          body: "mapping-body",
        },
        Refresh: {
          method: "POST",
          endpoint: "Sessions/Refresh",
        },
      },
    },
    ical: {
      api: "{url}",
      proxyHandler: calendarHandler,
    },
  },
}));

import handler from "./proxy";

function createReq({ method = "GET", body, query = {} } = {}) {
  return { method, body, query };
}

describe("pages/api/services/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("client request shaping", () => {
    it("forces GET and drops the body on the no-endpoint quick return", async () => {
      getServiceWidget.mockResolvedValue({ type: "noendpoint", url: "http://example" });

      const req = createReq({
        method: "POST",
        body: '{"cmd":"delete_all"}',
        query: { group: "g", service: "svc", index: "0" },
      });

      await handler(req, createMockRes());

      expect(genericHandler).toHaveBeenCalledTimes(1);
      const forwarded = genericHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("GET");
      expect(forwarded.body).toBeUndefined();
    });

    it.each(["PUT", "DELETE", "PATCH"])("forces GET for a %s on the no-endpoint quick return", async (method) => {
      getServiceWidget.mockResolvedValue({ type: "noendpoint", url: "http://example" });

      const req = createReq({ method, body: "payload", query: { group: "g", service: "svc", index: "0" } });

      await handler(req, createMockRes());

      const forwarded = genericHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("GET");
      expect(forwarded.body).toBeUndefined();
    });

    it("forces GET and drops the body on the allowedEndpoints path", async () => {
      getServiceWidget.mockResolvedValue({ type: "allowed", url: "http://example" });

      const req = createReq({
        method: "DELETE",
        body: "payload",
        query: { group: "g", service: "svc", endpoint: "status", index: "0" },
      });

      await handler(req, createMockRes());

      expect(allowedHandler).toHaveBeenCalledTimes(1);
      const forwarded = allowedHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("GET");
      expect(forwarded.body).toBeUndefined();
    });

    it("forces GET and drops the body on the calendar exception path", async () => {
      getServiceWidget.mockResolvedValue({ type: "calendar", url: "http://example" });

      const req = createReq({
        method: "POST",
        body: "payload",
        query: { group: "g", service: "svc", endpoint: "events", index: "0" },
      });

      await handler(req, createMockRes());

      expect(calendarHandler).toHaveBeenCalledTimes(1);
      const forwarded = calendarHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("GET");
      expect(forwarded.body).toBeUndefined();
    });

    it("forces GET for a mapping that does not declare a method", async () => {
      getServiceWidget.mockResolvedValue({ type: "mapped", url: "http://example" });

      const req = createReq({
        method: "POST",
        body: "payload",
        query: { group: "g", service: "svc", endpoint: "Sessions", index: "0" },
      });

      await handler(req, createMockRes());

      const forwarded = mappedHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("GET");
      expect(forwarded.body).toBeUndefined();
    });

    it("drops a client body when a non-GET mapping does not declare one", async () => {
      getServiceWidget.mockResolvedValue({ type: "mapped", url: "http://example" });

      const req = createReq({
        method: "POST",
        body: "attacker-controlled",
        query: { group: "g", service: "svc", endpoint: "Refresh", index: "0" },
      });

      await handler(req, createMockRes());

      const forwarded = mappedHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("POST");
      expect(forwarded.body).toBeUndefined();
    });
  });

  describe("mapping opt-in", () => {
    it("still allows a mapping to declare a non-GET method and body", async () => {
      getServiceWidget.mockResolvedValue({ type: "mapped", url: "http://example" });

      const req = createReq({
        method: "POST",
        query: { group: "g", service: "svc", endpoint: "Pause", index: "0" },
      });

      await handler(req, createMockRes());

      expect(mappedHandler).toHaveBeenCalledTimes(1);
      const forwarded = mappedHandler.mock.calls[0][0];
      expect(forwarded.method).toBe("POST");
      expect(forwarded.body).toBe("mapping-body");
      expect(forwarded.query.endpoint).toBe("Sessions/Playing/Pause");
    });

    it("rejects a method that does not match the mapping", async () => {
      getServiceWidget.mockResolvedValue({ type: "mapped", url: "http://example" });

      const req = createReq({
        method: "GET",
        query: { group: "g", service: "svc", endpoint: "Pause", index: "0" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(mappedHandler).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: "Unsupported method" });
    });
  });

  describe("dispatch guards", () => {
    it("rejects an endpoint that fails the allowedEndpoints test", async () => {
      getServiceWidget.mockResolvedValue({ type: "allowed", url: "http://example" });

      const req = createReq({ query: { group: "g", service: "svc", endpoint: "shutdown", index: "0" } });
      const res = createMockRes();

      await handler(req, res);

      expect(allowedHandler).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: "Unmapped proxy request." });
    });

    it("rejects an unknown widget type", async () => {
      getServiceWidget.mockResolvedValue({ type: "nope", url: "http://example" });

      const req = createReq({ query: { group: "g", service: "svc", index: "0" } });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: "Unknown proxy service type" });
    });
  });
});
