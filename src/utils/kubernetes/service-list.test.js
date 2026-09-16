import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getKubernetes, getKubeConfig, logger } = vi.hoisted(() => {
  const state = {
    serviceEnabled: true,
    items: [],
    throw: null,
    core: {
      listServiceForAllNamespaces: vi.fn(async () => {
        if (state.throw) throw state.throw;
        return { items: state.items };
      }),
    },
    kc: {
      makeApiClient: vi.fn(() => state.core),
    },
  };

  return {
    state,
    getKubernetes: vi.fn(() => ({ service: state.serviceEnabled })),
    getKubeConfig: vi.fn(() => state.kc),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  CoreV1Api: class CoreV1Api {},
}));

vi.mock("utils/config/kubernetes", () => ({
  getKubernetes,
  getKubeConfig,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

describe("utils/kubernetes/service-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.serviceEnabled = true;
    state.items = [];
    state.throw = null;
  });

  it("returns an empty list when service discovery is disabled", async () => {
    state.serviceEnabled = false;
    vi.resetModules();
    const listService = (await import("./service-list")).default;

    const result = await listService();

    expect(result).toEqual([]);
    expect(state.core.listServiceForAllNamespaces).not.toHaveBeenCalled();
  });

  it("returns items from listServiceForAllNamespaces", async () => {
    state.items = [{ metadata: { name: "s1" } }];
    vi.resetModules();
    const listService = (await import("./service-list")).default;

    const result = await listService();

    expect(result).toEqual([{ metadata: { name: "s1" } }]);
  });

  it("returns an empty list on errors", async () => {
    state.throw = { statusCode: 500, body: "nope", response: "x" };
    vi.resetModules();
    const listService = (await import("./service-list")).default;

    const result = await listService();

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
  });
});
