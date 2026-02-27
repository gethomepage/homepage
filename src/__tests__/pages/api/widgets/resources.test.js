import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { si, logger } = vi.hoisted(() => ({
  si: {
    currentLoad: vi.fn(),
    fsSize: vi.fn(),
    mem: vi.fn(),
    cpuTemperature: vi.fn(),
    time: vi.fn(),
    networkStats: vi.fn(),
    networkInterfaceDefault: vi.fn(),
  },
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("systeminformation", () => ({ default: si }));

import handler from "pages/api/widgets/resources";

describe("pages/api/widgets/resources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns CPU load data", async () => {
    si.currentLoad.mockResolvedValueOnce({ currentLoad: 12.34, avgLoad: 1.23 });

    const req = { query: { type: "cpu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.cpu).toEqual({ usage: 12.34, load: 1.23 });
  });

  it("returns 404 when requested disk target does not exist", async () => {
    si.fsSize.mockResolvedValueOnce([{ mount: "/" }]);

    const req = { query: { type: "disk", target: "/missing" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Resource not available." });
    expect(logger.warn).toHaveBeenCalled();
  });

  it("returns disk info for the requested mount", async () => {
    si.fsSize.mockResolvedValueOnce([{ mount: "/data", size: 1 }]);

    const req = { query: { type: "disk", target: "/data" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.drive).toEqual({ mount: "/data", size: 1 });
  });

  it("returns memory, cpu temp and uptime", async () => {
    si.mem.mockResolvedValueOnce({ total: 10 });
    si.cpuTemperature.mockResolvedValueOnce({ main: 50 });
    si.time.mockResolvedValueOnce({ uptime: 123 });

    const resMem = createMockRes();
    await handler({ query: { type: "memory" } }, resMem);
    expect(resMem.statusCode).toBe(200);
    expect(resMem.body.memory).toEqual({ total: 10 });

    const resTemp = createMockRes();
    await handler({ query: { type: "cputemp" } }, resTemp);
    expect(resTemp.statusCode).toBe(200);
    expect(resTemp.body.cputemp).toEqual({ main: 50 });

    const resUptime = createMockRes();
    await handler({ query: { type: "uptime" } }, resUptime);
    expect(resUptime.statusCode).toBe(200);
    expect(resUptime.body.uptime).toBe(123);
  });

  it("returns 404 when requested network interface does not exist", async () => {
    si.networkStats.mockResolvedValueOnce([{ iface: "en0" }]).mockResolvedValueOnce([
      {
        iface: "missing",
        operstate: "unknown",
        rx_bytes: 0,
        rx_dropped: 0,
        rx_errors: 0,
        tx_bytes: 0,
        tx_dropped: 0,
        tx_errors: 0,
        rx_sec: null,
        tx_sec: null,
        ms: 0,
      },
    ]);

    const req = { query: { type: "network", interfaceName: "missing" } };
    const res = createMockRes();

    await handler(req, res);

    expect(si.networkStats).toHaveBeenNthCalledWith(1, "*");
    expect(si.networkStats).toHaveBeenNthCalledWith(2, "missing");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Interface not found" });
  });

  it("falls back to direct named interface query when wildcard enumeration misses it", async () => {
    si.networkStats.mockResolvedValueOnce([{ iface: "eth0", rx_bytes: 1 }]).mockResolvedValueOnce([
      {
        iface: "eno1",
        operstate: "up",
        rx_bytes: 1000,
        rx_dropped: 0,
        rx_errors: 0,
        tx_bytes: 500,
        tx_dropped: 0,
        tx_errors: 0,
        rx_sec: null,
        tx_sec: null,
        ms: 0,
      },
    ]);

    const req = { query: { type: "network", interfaceName: "eno1" } };
    const res = createMockRes();

    await handler(req, res);

    expect(si.networkStats).toHaveBeenNthCalledWith(1, "*");
    expect(si.networkStats).toHaveBeenNthCalledWith(2, "eno1");
    expect(res.statusCode).toBe(200);
    expect(res.body.interface).toBe("eno1");
    expect(res.body.network).toEqual({
      iface: "eno1",
      operstate: "up",
      rx_bytes: 1000,
      rx_dropped: 0,
      rx_errors: 0,
      tx_bytes: 500,
      tx_dropped: 0,
      tx_errors: 0,
      rx_sec: null,
      tx_sec: null,
      ms: 0,
    });
  });

  it("returns default interface network stats", async () => {
    si.networkStats.mockResolvedValueOnce([{ iface: "en0", rx_bytes: 1 }]);
    si.networkInterfaceDefault.mockResolvedValueOnce("en0");

    const req = { query: { type: "network" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.interface).toBe("en0");
    expect(res.body.network).toEqual({ iface: "en0", rx_bytes: 1 });
  });

  it("returns 404 when the default interface cannot be found in networkStats", async () => {
    si.networkStats.mockResolvedValueOnce([{ iface: "en0", rx_bytes: 1 }]);
    si.networkInterfaceDefault.mockResolvedValueOnce("en1");

    const req = { query: { type: "network" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Default interface not found" });
  });

  it("returns 400 for an invalid type", async () => {
    const req = { query: { type: "nope" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "invalid type" });
  });
});
