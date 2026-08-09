import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getPrivateWidgetOptions, httpProxy, logger } = vi.hoisted(() => ({
  getPrivateWidgetOptions: vi.fn(),
  httpProxy: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("utils/config/widget-helpers", () => ({
  getPrivateWidgetOptions,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/widgets/proxmox";

const clusterResources = [
  { type: "qemu", template: 0, node: "n1", status: "running" },
  { type: "qemu", template: 0, node: "n1", status: "stopped" },
  { type: "lxc", template: 0, node: "n1", status: "running" },
  { type: "node", node: "n1", status: "online", maxmem: 100, mem: 50, maxcpu: 4, cpu: 0.25 },
];

describe("pages/api/widgets/proxmox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the widget URL is missing", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing Proxmox URL");
  });

  it("builds the PVEAPIToken header and returns aggregated cluster stats", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "https://proxmox.host", username: "api@pam!homepage", password: "secret" });
    httpProxy.mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ data: clusterResources }))]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith(
      "https://proxmox.host/api2/json/cluster/resources",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "PVEAPIToken=api@pam!homepage=secret" }),
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      vms: { running: 1, total: 2 },
      lxc: { running: 1, total: 1 },
      cpu: { percent: 25 },
      memory: { percent: 50 },
    });
  });

  it("filters stats down to a single node when node is provided", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "https://proxmox.host", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([
      200,
      null,
      Buffer.from(
        JSON.stringify({
          data: [
            ...clusterResources,
            { type: "node", node: "n2", status: "online", maxmem: 100, mem: 10, maxcpu: 4, cpu: 0.5 },
          ],
        }),
      ),
    ]);

    const req = { query: { index: "0", node: "n1" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      vms: { running: 1, total: 2 },
      lxc: { running: 1, total: 1 },
      cpu: { percent: 25 },
      memory: { percent: 50 },
    });
  });

  it("returns zero percentages without dividing by zero when there are no online nodes", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "https://proxmox.host", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ data: [] }))]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      vms: { running: 0, total: 0 },
      lxc: { running: 0, total: 0 },
      cpu: { percent: 0 },
      memory: { percent: 0 },
    });
  });

  it("returns 400 when the Proxmox API responds with a non-200 status", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "https://proxmox.host", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([401, null, Buffer.from("nope")]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.stringContaining("HTTP 401") }));
  });
});
