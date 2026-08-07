import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getKubernetes, getKubeConfig, logger } = vi.hoisted(() => {
  const state = {
    enabled: true,
    items: [{ metadata: { name: "r1" } }, { metadata: { name: "r2" } }],
    crd: {
      listClusterCustomObject: vi.fn(async () => ({ items: state.items })),
    },
    kc: {
      makeApiClient: vi.fn(() => state.crd),
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
    state.items = [{ metadata: { name: "r1" } }, { metadata: { name: "r2" } }];
  });

  it("returns an empty list when gateway discovery is disabled", async () => {
    state.enabled = false;
    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result).toEqual([]);
  });

  it("lists httproutes", async () => {
    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result.map((r) => r.metadata.name)).toEqual(["r1", "r2"]);
    expect(state.crd.listClusterCustomObject).toHaveBeenCalled();
  });

  it("logs and returns [] when cluster listing fails", async () => {
    state.crd.listClusterCustomObject.mockRejectedValueOnce({ statusCode: 500, body: "boom", response: "resp" });

    vi.resetModules();
    const listHttpRoute = (await import("./httproute-list")).default;

    const result = await listHttpRoute();

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });
});
