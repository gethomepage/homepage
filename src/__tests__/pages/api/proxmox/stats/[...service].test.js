import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getProxmoxConfig, httpProxy, logger } = vi.hoisted(() => ({
  getProxmoxConfig: vi.fn(),
  httpProxy: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("utils/config/proxmox", () => ({
  getProxmoxConfig,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/proxmox/stats/[...service]";

describe("pages/api/proxmox/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when node param is missing", async () => {
    const req = { query: { service: [], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Proxmox node parameter is required" });
  });

  it("returns 500 when proxmox config is missing", async () => {
    getProxmoxConfig.mockReturnValue(null);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Proxmox server configuration not found" });
  });

  it("returns 400 when node config is missing and legacy credentials are not present", async () => {
    getProxmoxConfig.mockReturnValue({ other: { url: "http://x", token: "t", secret: "s" } });

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.stringContaining("Proxmox config not found for the specified node"),
      }),
    );
  });

  it("returns status/cpu/mem for a successful Proxmox response using per-node credentials", async () => {
    getProxmoxConfig.mockReturnValue({
      pve: { url: "http://pve", token: "tok", secret: "sec" },
    });
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { status: "running", cpu: 0.2, mem: 123 } })),
    ]);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("http://pve/api2/json/nodes/pve/qemu/100/status/current", {
      method: "GET",
      headers: { Authorization: "PVEAPIToken=tok=sec" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", cpu: 0.2, mem: 123 });
  });

  it("falls back to legacy top-level credentials when no node block exists", async () => {
    getProxmoxConfig.mockReturnValue({ url: "http://pve", token: "tok", secret: "sec" });
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { cpu: 0.1, mem: 1 } })),
    ]);

    const req = { query: { service: ["pve", "100"], type: "lxc" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith("http://pve/api2/json/nodes/pve/lxc/100/status/current", expect.any(Object));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "unknown", cpu: 0.1, mem: 1 });
  });

  it("returns a non-200 status when Proxmox responds with an error", async () => {
    getProxmoxConfig.mockReturnValue({ url: "http://pve", token: "tok", secret: "sec" });
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from(JSON.stringify({ error: "no" }))]);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Failed to fetch Proxmox qemu status" });
  });

  it("returns 500 when the Proxmox response is missing expected data", async () => {
    getProxmoxConfig.mockReturnValue({ url: "http://pve", token: "tok", secret: "sec" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({}))]);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Invalid response from Proxmox API" });
  });

  it("logs and returns 500 when an unexpected error occurs", async () => {
    getProxmoxConfig.mockReturnValue({ url: "http://pve", token: "tok", secret: "sec" });
    httpProxy.mockRejectedValueOnce(new Error("boom"));

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch Proxmox status" });
  });
});
