import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getKubernetes, getKubeConfig, checkCRD, logger } = vi.hoisted(() => {
  const state = {
    enabled: true,
    containoItems: [],
    ioItems: [],
    crd: {
      listClusterCustomObject: vi.fn(async ({ group }) => {
        if (group === "traefik.containo.us") return { items: state.containoItems };
        if (group === "traefik.io") return { items: state.ioItems };
        return { items: [] };
      }),
    },
    kc: {
      makeApiClient: vi.fn(() => state.crd),
    },
  };

  return {
    state,
    getKubernetes: vi.fn(() => ({ traefik: state.enabled })),
    getKubeConfig: vi.fn(() => state.kc),
    checkCRD: vi.fn(async () => true),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  CustomObjectsApi: class CustomObjectsApi {},
}));

vi.mock("utils/config/kubernetes", () => ({
  ANNOTATION_BASE: "gethomepage.dev",
  checkCRD,
  getKubeConfig,
  getKubernetes,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

describe("utils/kubernetes/traefik-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.enabled = true;
    state.containoItems = [];
    state.ioItems = [];
    state.crd.listClusterCustomObject.mockImplementation(async ({ group }) => {
      if (group === "traefik.containo.us") return { items: state.containoItems };
      if (group === "traefik.io") return { items: state.ioItems };
      return { items: [] };
    });
    checkCRD.mockResolvedValue(true);
  });

  it("returns an empty list when traefik discovery is disabled", async () => {
    state.enabled = false;
    vi.resetModules();
    const listTraefikIngress = (await import("./traefik-list")).default;

    const result = await listTraefikIngress();

    expect(result).toEqual([]);
  });

  it("filters and merges ingressroutes with homepage href annotations", async () => {
    state.containoItems = [
      { metadata: { annotations: { "gethomepage.dev/href": "http://a" } } },
      { metadata: { annotations: {} } },
    ];
    state.ioItems = [{ metadata: { annotations: { "gethomepage.dev/href": "http://b" } } }];
    vi.resetModules();
    const listTraefikIngress = (await import("./traefik-list")).default;

    const result = await listTraefikIngress();

    expect(result).toHaveLength(2);
    expect(result[0].metadata.annotations["gethomepage.dev/href"]).toBe("http://a");
    expect(result[1].metadata.annotations["gethomepage.dev/href"]).toBe("http://b");
    expect(checkCRD).toHaveBeenCalled();
  });

  it("logs errors when traefik CRDs exist and the API calls fail", async () => {
    const err = { statusCode: 500, body: "nope", response: "nope" };
    state.crd.listClusterCustomObject.mockRejectedValue(err);

    vi.resetModules();
    const listTraefikIngress = (await import("./traefik-list")).default;

    const result = await listTraefikIngress();

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(err);
  });

  it("suppresses API errors when the CRD is not installed", async () => {
    checkCRD.mockResolvedValue(false);
    state.crd.listClusterCustomObject.mockRejectedValue({ statusCode: 500 });

    vi.resetModules();
    const listTraefikIngress = (await import("./traefik-list")).default;

    const result = await listTraefikIngress();

    expect(result).toEqual([]);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
