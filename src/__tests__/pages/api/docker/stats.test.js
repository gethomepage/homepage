import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getDockerStats, logger } = vi.hoisted(() => ({
  getDockerStats: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("utils/docker/stats", () => ({ getDockerStats }));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/docker/stats";

describe("pages/api/docker/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the stats map for the requested server", async () => {
    getDockerStats.mockResolvedValue({ stats: { app: { cpu: 20, mem: 900, rx: 4, tx: 6 } } });

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerStats).toHaveBeenCalledWith("local");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stats: { app: { cpu: 20, mem: 900, rx: 4, tx: 6 } } });
  });

  it("returns 500 when the stats lookup reports an error", async () => {
    getDockerStats.mockResolvedValue({ error: "query failed" });

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "query failed" });
  });

  it("logs and returns 500 when the stats lookup throws", async () => {
    getDockerStats.mockRejectedValue(new Error("boom"));

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "boom" } });
    expect(logger.error).toHaveBeenCalled();
  });
});
