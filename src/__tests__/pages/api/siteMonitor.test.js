import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getServiceItem, httpProxy, perf, logger } = vi.hoisted(() => ({
  getServiceItem: vi.fn(),
  httpProxy: vi.fn(),
  perf: { now: vi.fn() },
  logger: { debug: vi.fn() },
}));

vi.mock("perf_hooks", () => ({
  performance: perf,
}));

vi.mock("utils/config/service-helpers", () => ({
  getServiceItem,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/siteMonitor";

describe("pages/api/siteMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the service item is missing", async () => {
    getServiceItem.mockResolvedValueOnce(null);

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Unable to find service");
  });

  it("returns 400 when the monitor URL is missing", async () => {
    getServiceItem.mockResolvedValueOnce({ siteMonitor: "" });

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("No http monitor URL given");
  });

  it("uses HEAD and returns status + latency when the response is OK", async () => {
    getServiceItem.mockResolvedValueOnce({ siteMonitor: "http://example.com" });
    perf.now.mockReturnValueOnce(1).mockReturnValueOnce(11);
    httpProxy.mockResolvedValueOnce([200]);

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("http://example.com", { method: "HEAD" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.latency).toBe(10);
  });

  it("falls back to GET when HEAD is rejected", async () => {
    getServiceItem.mockResolvedValueOnce({ siteMonitor: "http://example.com" });
    perf.now.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(5).mockReturnValueOnce(15);
    httpProxy.mockResolvedValueOnce([500]).mockResolvedValueOnce([200]);

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenNthCalledWith(1, "http://example.com", { method: "HEAD" });
    expect(httpProxy).toHaveBeenNthCalledWith(2, "http://example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 200, latency: 10 });
  });

  it("returns 400 when httpProxy throws", async () => {
    getServiceItem.mockResolvedValueOnce({ siteMonitor: "http://example.com" });
    httpProxy.mockRejectedValueOnce(new Error("nope"));

    const req = { query: { groupName: "g", serviceName: "s" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Error attempting http monitor");
  });
});
