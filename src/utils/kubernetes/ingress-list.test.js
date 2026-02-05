import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getKubernetes, getKubeConfig, logger } = vi.hoisted(() => {
  const state = {
    ingressEnabled: true,
    items: [],
    throw: null,
    networking: {
      listIngressForAllNamespaces: vi.fn(async () => {
        if (state.throw) throw state.throw;
        return { items: state.items };
      }),
    },
    kc: {
      makeApiClient: vi.fn(() => state.networking),
    },
  };

  return {
    state,
    getKubernetes: vi.fn(() => ({ ingress: state.ingressEnabled })),
    getKubeConfig: vi.fn(() => state.kc),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  NetworkingV1Api: class NetworkingV1Api {},
}));

vi.mock("utils/config/kubernetes", () => ({
  getKubernetes,
  getKubeConfig,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

describe("utils/kubernetes/ingress-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.ingressEnabled = true;
    state.items = [];
    state.throw = null;
  });

  it("returns an empty list when ingress discovery is disabled", async () => {
    state.ingressEnabled = false;
    vi.resetModules();
    const listIngress = (await import("./ingress-list")).default;

    const result = await listIngress();

    expect(result).toEqual([]);
    expect(state.networking.listIngressForAllNamespaces).not.toHaveBeenCalled();
  });

  it("returns items from listIngressForAllNamespaces", async () => {
    state.items = [{ metadata: { name: "i1" } }];
    vi.resetModules();
    const listIngress = (await import("./ingress-list")).default;

    const result = await listIngress();

    expect(result).toEqual([{ metadata: { name: "i1" } }]);
  });

  it("returns an empty list on errors", async () => {
    state.throw = { statusCode: 500, body: "nope", response: "x" };
    vi.resetModules();
    const listIngress = (await import("./ingress-list")).default;

    const result = await listIngress();

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
  });
});
