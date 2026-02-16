import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getKubernetes, getKubeConfig, logger } = vi.hoisted(() => {
  const state = {
    enabled: true,
    namespaces: ["a", "b"],
    routesByNs: {
      a: [{ metadata: { name: "r1" } }],
      b: [{ metadata: { name: "r2" } }],
    },
    crd: {
      listNamespacedCustomObject: vi.fn(async ({ namespace }) => ({ items: state.routesByNs[namespace] ?? [] })),
    },
    core: {
      listNamespace: vi.fn(async () => ({ items: state.namespaces.map((n) => ({ metadata: { name: n } })) })),
    },
    kc: {
      makeApiClient: vi.fn((Api) => (Api.name === "CoreV1Api" ? state.core : state.crd)),
    },
  };

  return {
    state,
    getKubernetes: vi.fn(() => ({ gateway: state.enabled })),
    getKubeConfig: vi.fn(() => state.kc),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  CoreV1Api: class CoreV1Api {},
  CustomObjectsApi: class CustomObjectsApi {},
}));

vi.mock("utils/config/kubernetes", () => ({
  getKubeConfig,
  getKubernetes,
  HTTPROUTE_API_GROUP: "gateway.networking.k8s.io",
  HTTPROUTE_API_VERSION: "v1",
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

describe("utils/kubernetes/httproute-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.enabled = true;
    state.namespaces = ["a", "b"];
    state.routesByNs = {
      a: [{ metadata: { name: "r1" } }],
      b: [{ metadata: { name: "r2" } }],
    };
  });

  it("returns an empty list when gateway discovery is disabled", async () => {
    state.enabled = false;
    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result).toEqual([]);
  });

  it("lists namespaces and aggregates httproutes", async () => {
    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result.map((r) => r.metadata.name)).toEqual(["r1", "r2"]);
    expect(state.core.listNamespace).toHaveBeenCalled();
    expect(state.crd.listNamespacedCustomObject).toHaveBeenCalledTimes(2);
  });

  it("logs and returns [] when namespace listing fails", async () => {
    state.core.listNamespace.mockRejectedValueOnce({ statusCode: 500, body: "boom", response: "resp" });

    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it("skips namespaces whose httproute queries fail", async () => {
    state.crd.listNamespacedCustomObject.mockImplementation(async ({ namespace }) => {
      if (namespace === "b") throw { statusCode: 500, body: "boom", response: "resp" };
      return { items: state.routesByNs[namespace] ?? [] };
    });

    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result.map((r) => r.metadata.name)).toEqual(["r1"]);
    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });
});
