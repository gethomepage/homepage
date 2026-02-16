import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { kc, coreApi, metricsApi, getKubeConfig, parseCpu, parseMemory, logger } = vi.hoisted(() => {
  const coreApi = { listNode: vi.fn() };
  const metricsApi = { getNodeMetrics: vi.fn() };

  const kc = {
    makeApiClient: vi.fn(() => coreApi),
  };

  return {
    kc,
    coreApi,
    metricsApi,
    getKubeConfig: vi.fn(),
    parseCpu: vi.fn(),
    parseMemory: vi.fn(),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
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

import handler from "pages/api/widgets/kubernetes";

describe("pages/api/widgets/kubernetes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 500 when no kube config is available", async () => {
    getKubeConfig.mockReturnValueOnce(null);

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("No kubernetes configuration");
  });

  it("returns 500 when listing nodes fails", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    coreApi.listNode.mockResolvedValueOnce(null);

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("fetching nodes");
  });

  it("logs and returns 500 when listing nodes throws", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    coreApi.listNode.mockRejectedValueOnce({ statusCode: 500, body: "nope", response: "nope" });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("fetching nodes");
  });

  it("returns 500 when metrics lookup fails", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    parseMemory.mockReturnValue(100);
    coreApi.listNode.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "n1" },
          status: { capacity: { cpu: "1", memory: "100" }, conditions: [{ type: "Ready", status: "True" }] },
        },
      ],
    });
    metricsApi.getNodeMetrics.mockRejectedValueOnce(new Error("nope"));

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("Error getting metrics");
  });

  it("returns cluster totals and per-node usage", async () => {
    getKubeConfig.mockReturnValueOnce(kc);

    parseMemory.mockImplementation((value) => {
      if (value === "100") return 100;
      if (value === "50") return 50;
      if (value === "30") return 30;
      return 0;
    });
    parseCpu.mockImplementation((value) => {
      if (value === "100m") return 0.1;
      if (value === "200m") return 0.2;
      return 0;
    });

    coreApi.listNode.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "n1" },
          status: { capacity: { cpu: "1", memory: "100" }, conditions: [{ type: "Ready", status: "True" }] },
        },
        {
          metadata: { name: "n2" },
          status: { capacity: { cpu: "2", memory: "50" }, conditions: [{ type: "Ready", status: "False" }] },
        },
      ],
    });

    metricsApi.getNodeMetrics.mockResolvedValueOnce({
      items: [
        { metadata: { name: "n1" }, usage: { cpu: "100m", memory: "30" } },
        { metadata: { name: "n2" }, usage: { cpu: "200m", memory: "50" } },
      ],
    });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.cluster.cpu.total).toBe(3);
    expect(res.body.cluster.cpu.load).toBeCloseTo(0.3);
    expect(res.body.cluster.memory.total).toBe(150);
    expect(res.body.nodes).toHaveLength(2);
    expect(res.body.nodes.find((n) => n.name === "n1").cpu.percent).toBeCloseTo(10);
  });

  it("returns a metrics error when metrics contain an unexpected node name", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    parseMemory.mockReturnValue(100);
    parseCpu.mockReturnValue(0.1);

    coreApi.listNode.mockResolvedValueOnce({
      items: [
        {
          metadata: { name: "n1" },
          status: { capacity: { cpu: "1", memory: "100" }, conditions: [{ type: "Ready", status: "True" }] },
        },
      ],
    });
    metricsApi.getNodeMetrics.mockResolvedValueOnce({
      items: [{ metadata: { name: "n2" }, usage: { cpu: "100m", memory: "30" } }],
    });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("Error getting metrics");
    expect(logger.error).toHaveBeenCalled();
  });

  it("returns 500 when an unexpected error is thrown", async () => {
    getKubeConfig.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "unknown error" });
    expect(logger.error).toHaveBeenCalled();
  });
});
