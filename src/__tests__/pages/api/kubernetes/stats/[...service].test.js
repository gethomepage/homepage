import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getKubeConfig, coreApi, metricsApi, MetricsCtor, logger } = vi.hoisted(() => {
  const metricsApi = {
    getPodMetrics: vi.fn(),
  };

  function MetricsCtor() {
    return metricsApi;
  }

  return {
    getKubeConfig: vi.fn(),
    coreApi: { listNamespacedPod: vi.fn() },
    metricsApi,
    MetricsCtor,
    logger: { error: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  CoreV1Api: function CoreV1Api() {},
  Metrics: MetricsCtor,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/kubernetes", () => ({
  getKubeConfig,
}));

import handler from "pages/api/kubernetes/stats/[...service]";

describe("pages/api/kubernetes/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getKubeConfig.mockReturnValue({
      makeApiClient: () => coreApi,
    });
  });

  it("returns 400 when namespace/appName params are missing", async () => {
    const req = { query: { service: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "kubernetes query parameters are required" });
  });

  it("returns 500 when kubernetes is not configured", async () => {
    getKubeConfig.mockReturnValue(null);

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "No kubernetes configuration" });
  });

  it("returns 500 when listNamespacedPod fails", async () => {
    coreApi.listNamespacedPod.mockRejectedValue({ statusCode: 500, body: "nope", response: "nope" });

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Error communicating with kubernetes" });
  });

  it("returns 404 when no pods match the selector", async () => {
    coreApi.listNamespacedPod.mockResolvedValue({ items: [] });

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: "no pods found with namespace=default and labelSelector=app.kubernetes.io/name=app",
    });
  });

  it("computes limits even when metrics are missing (404 from metrics server)", async () => {
    coreApi.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: "pod-a" },
          spec: {
            containers: [
              { resources: { limits: { cpu: "500m", memory: "1Gi" } } },
              { resources: { limits: { cpu: "250m" } } },
            ],
          },
        },
      ],
    });

    metricsApi.getPodMetrics.mockRejectedValue({ statusCode: 404, body: "no metrics", response: "no metrics" });

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      stats: {
        mem: 0,
        cpu: 0,
        cpuLimit: 0.75,
        memLimit: 1000000000,
        cpuUsage: 0,
        memUsage: 0,
      },
    });
  });

  it("logs when metrics lookup fails with a non-404 error and still returns computed limits", async () => {
    coreApi.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: "pod-a" },
          spec: {
            containers: [{ resources: { limits: { cpu: "500m", memory: "1Gi" } } }],
          },
        },
      ],
    });

    metricsApi.getPodMetrics.mockRejectedValue({ statusCode: 500, body: "boom", response: "boom" });

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.stats.cpuLimit).toBe(0.5);
    expect(res.body.stats.memLimit).toBe(1000000000);
    expect(res.body.stats.cpu).toBe(0);
    expect(res.body.stats.mem).toBe(0);
  });

  it("aggregates usage for matched pods and reports percent usage", async () => {
    coreApi.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: "pod-a" },
          spec: { containers: [{ resources: { limits: { cpu: "1000m", memory: "2Gi" } } }] },
        },
        {
          metadata: { name: "pod-b" },
          spec: { containers: [{ resources: { limits: { cpu: "500m", memory: "1Gi" } } }] },
        },
      ],
    });

    metricsApi.getPodMetrics.mockResolvedValue({
      items: [
        // includes a non-selected pod, should be ignored
        { metadata: { name: "other" }, containers: [{ usage: { cpu: "100m", memory: "10Mi" } }] },
        {
          metadata: { name: "pod-a" },
          containers: [{ usage: { cpu: "250m", memory: "100Mi" } }, { usage: { cpu: "250m", memory: "100Mi" } }],
        },
        { metadata: { name: "pod-b" }, containers: [{ usage: { cpu: "500m", memory: "1Gi" } }] },
      ],
    });

    const req = { query: { service: ["default", "app"], podSelector: "app=test" } };
    const res = createMockRes();

    await handler(req, res);

    const { stats } = res.body;
    expect(stats.cpuLimit).toBe(1.5);
    expect(stats.memLimit).toBe(3000000000);
    expect(stats.cpu).toBeCloseTo(1.0, 5);
    expect(stats.mem).toBe(1200000000);
    expect(stats.cpuUsage).toBeCloseTo((100 * 1.0) / 1.5, 5);
    expect(stats.memUsage).toBeCloseTo((100 * 1200000000) / 3000000000, 5);
  });

  it("returns 500 when an unexpected error is thrown", async () => {
    getKubeConfig.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const req = { query: { service: ["default", "app"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "unknown error" });
    expect(logger.error).toHaveBeenCalled();
  });
});
