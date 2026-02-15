import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceItem, ping, logger } = vi.hoisted(() => ({
  getServiceItem: vi.fn(),
  ping: { probe: vi.fn() },
  logger: { debug: vi.fn() },
}));

vi.mock("utils/config/service-helpers", () => ({
  getServiceItem,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("ping", () => ({
  promise: ping,
}));

import handler from "pages/api/ping";

describe("pages/api/ping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when service item isn't found", async () => {
    getServiceItem.mockResolvedValueOnce(null);

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Unable to find service");
  });

  it("returns 400 when ping host isn't configured", async () => {
    getServiceItem.mockResolvedValueOnce({ ping: "" });

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No ping host given");
  });

  it("pings the hostname extracted from a URL", async () => {
    getServiceItem.mockResolvedValueOnce({ ping: "http://example.com:1234/path" });
    ping.probe.mockResolvedValueOnce({ alive: true });

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(ping.probe).toHaveBeenCalledWith("example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ alive: true });
  });

  it("returns 400 when ping throws", async () => {
    getServiceItem.mockResolvedValueOnce({ ping: "example.com" });
    ping.probe.mockRejectedValueOnce(new Error("nope"));

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Error attempting ping");
  });
});
