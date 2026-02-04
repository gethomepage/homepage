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

import handler from "./[...service]";

describe("pages/api/proxmox/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when proxmox node parameter is missing", async () => {
    const req = { query: { service: [], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Proxmox node");
  });

  it("returns 500 when proxmox config is missing", async () => {
    getProxmoxConfig.mockReturnValueOnce(null);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("configuration");
  });

  it("returns 400 when node config is missing and legacy creds are not present", async () => {
    getProxmoxConfig.mockReturnValueOnce({});

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Proxmox config not found");
  });

  it("calls proxmox status endpoint and returns normalized stats", async () => {
    getProxmoxConfig.mockReturnValueOnce({
      pve: { url: "http://pve", token: "t", secret: "s" },
    });
    httpProxy.mockResolvedValueOnce([
      200,
      null,
      Buffer.from(JSON.stringify({ data: { status: "running", cpu: 0.1, mem: 0.2 } })),
    ]);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith(
      "http://pve/api2/json/nodes/pve/qemu/100/status/current",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "PVEAPIToken=t=s",
        }),
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", cpu: 0.1, mem: 0.2 });
  });

  it("returns proxmox http errors as response status codes", async () => {
    getProxmoxConfig.mockReturnValueOnce({
      pve: { url: "http://pve", token: "t", secret: "s" },
    });
    httpProxy.mockResolvedValueOnce([401, null, Buffer.from("nope")]);

    const req = { query: { service: ["pve", "100"], type: "qemu" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain("Failed to fetch Proxmox");
  });
});
