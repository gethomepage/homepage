import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { coreApi, kc, getKubeConfig, logger } = vi.hoisted(() => {
  const coreApi = { listNamespacedPod: vi.fn() };
  const kc = { makeApiClient: vi.fn(() => coreApi) };
  const getKubeConfig = vi.fn();
  const logger = { error: vi.fn() };

  return { coreApi, kc, getKubeConfig, logger };
});

vi.mock("@kubernetes/client-node", () => ({
  CoreV1Api: class CoreV1Api {},
}));

vi.mock("../../../../utils/config/kubernetes", () => ({
  getKubeConfig,
}));

vi.mock("../../../../utils/logger", () => ({
  default: () => logger,
}));

import handler from "./[...service]";

describe("pages/api/kubernetes/status/[...service]", () => {
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
    expect(res.body.status).toBe("not found");
  });

  it("computes running/partial/down from pod phases", async () => {
    getKubeConfig.mockReturnValueOnce(kc);
    coreApi.listNamespacedPod.mockResolvedValueOnce({
      items: [{ status: { phase: "Running" } }, { status: { phase: "Running" } }],
    });

    const resRunning = createMockRes();
    await handler({ query: { service: ["ns", "app"] } }, resRunning);
    expect(resRunning.statusCode).toBe(200);
    expect(resRunning.body.status).toBe("running");

    getKubeConfig.mockReturnValueOnce(kc);
    coreApi.listNamespacedPod.mockResolvedValueOnce({
      items: [{ status: { phase: "Running" } }, { status: { phase: "Pending" } }],
    });

    const resPartial = createMockRes();
    await handler({ query: { service: ["ns", "app"] } }, resPartial);
    expect(resPartial.statusCode).toBe(200);
    expect(resPartial.body.status).toBe("partial");
  });
});
