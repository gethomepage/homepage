import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
  },
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

import calendarProxyHandler from "./proxy";

describe("widgets/calendar/proxy", () => {
  const envVersion = process.env.NEXT_PUBLIC_VERSION;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_VERSION = envVersion;
  });

  it("returns 400 when integration is missing", async () => {
    getServiceWidget.mockResolvedValue({ integrations: [] });

    const req = { query: { group: "g", service: "svc", endpoint: "foo", index: "0" } };
    const res = createMockRes();

    await calendarProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid integration" });
  });

  it("returns 403 when integration has no URL", async () => {
    getServiceWidget.mockResolvedValue({ integrations: [{ name: "foo", url: "" }] });

    const req = { query: { group: "g", service: "svc", endpoint: "foo", index: "0" } };
    const res = createMockRes();

    await calendarProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "No integration URL specified" });
  });

  it("adds a User-Agent for Outlook integrations and returns string data", async () => {
    process.env.NEXT_PUBLIC_VERSION = "1.2.3";
    getServiceWidget.mockResolvedValue({
      integrations: [{ name: "outlook", url: "https://example.com/outlook.ics" }],
    });

    httpProxy.mockResolvedValueOnce([200, "text/calendar", Buffer.from("CAL")]);

    const req = { query: { group: "g", service: "svc", endpoint: "outlook", index: "0" } };
    const res = createMockRes();

    await calendarProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("https://example.com/outlook.ics", {
      headers: { "User-Agent": "gethomepage/1.2.3" },
    });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/calendar");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: "CAL" });
  });

  it("passes through non-200 status codes from integrations", async () => {
    getServiceWidget.mockResolvedValue({
      integrations: [{ name: "foo", url: "https://example.com/foo.ics" }],
    });

    httpProxy.mockResolvedValueOnce([503, "text/plain", Buffer.from("nope")]);

    const req = { query: { group: "g", service: "svc", endpoint: "foo", index: "0" } };
    const res = createMockRes();

    await calendarProxyHandler(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual(Buffer.from("nope"));
  });
});
