import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { coreApi, metricsApi, kc, getKubeConfig, parseCpu, parseMemory, logger } = vi.hoisted(() => {
  const coreApi = { listNamespacedPod: vi.fn() };
  const metricsApi = { getPodMetrics: vi.fn() };
  const kc = { makeApiClient: vi.fn(() => coreApi) };

  const getKubeConfig = vi.fn();
  const parseCpu = vi.fn();
  const parseMemory = vi.fn();
  const logger = { error: vi.fn() };

  return { coreApi, metricsApi, kc, getKubeConfig, parseCpu, parseMemory, logger };
});

vi.mock("@kubernetes/client-node", () => ({
  CoreV1Api: class CoreV1Api {},
  Metrics: class Metrics {
    constructor() {
      return metricsApi;
    }
  },
}));

vi.mock("utils/config/kubernetes", () => ({
  getKubeConfig,
}));

vi.mock("utils/kubernetes/utils", () => ({
  parseCpu,
  parseMemory,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/kubernetes/stats/[...service]";

describe("pages/api/kubernetes/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when kubernetes parameters are missing", async () => {
    const req = { query: { service: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("kubernetes query parameters");
  });

  it("returns 500 when no kube config is available", async () => {
    getKubeConfig.mockReturnValueOnce(null);

    const req = { query: { service: ["ns", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("No kubernetes configuration");
  });

  it("returns 404 when no pods are found", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    coreApi.listNamespacedPod.mockResolvedValueOnce({ items: [] });

    const req = { query: { service: ["ns", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("no pods found");
  });

  it("returns limits even when metrics are not available yet", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    parseCpu.mockImplementation((v) => (v === "500m" ? 0.5 : 0));
    parseMemory.mockImplementation((v) => (v === "1Gi" ? 1024 : 0));

    coreApi.listNamespacedPod.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "p1" },
          spec: { containers: [{ resources: { limits: { cpu: "500m", memory: "1Gi" } } }] },
        },
      ],
    });
    metricsApi.getPodMetrics.mockRejectedValueOnce({ statusCode: 404 });

    const req = { query: { service: ["ns", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toEqual(
      expect.objectContaining({
        cpu: 0,
        mem: 0,
        cpuLimit: 0.5,
        memLimit: 1024,
        cpuUsage: 0,
        memUsage: 0,
      }),
    );
  });

  it("returns usage calculated from pod metrics", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    parseCpu.mockImplementation((v) => (v === "100m" ? 0.1 : v === "500m" ? 0.5 : 0));
    parseMemory.mockImplementation((v) => (v === "256Mi" ? 256 : v === "1Gi" ? 1024 : 0));

    coreApi.listNamespacedPod.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "p1" },
          spec: { containers: [{ resources: { limits: { cpu: "500m", memory: "1Gi" } } }] },
        },
      ],
    });
    metricsApi.getPodMetrics.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "p1" },
          containers: [{ usage: { cpu: "100m", memory: "256Mi" } }],
        },
      ],
    });

    const req = { query: { service: ["ns", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.cpu).toBeCloseTo(0.1);
    expect(res.body.stats.mem).toBe(256);
    expect(res.body.stats.cpuUsage).toBeCloseTo(20);
    expect(res.body.stats.memUsage).toBeCloseTo(25);
  });
});
