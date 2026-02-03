import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, fs, yaml, config, Docker, dockerCfg, kubeCfg, kubeApi } = vi.hoisted(() => {
  const state = {
    servicesYaml: null,
    dockerYaml: null,
    dockerContainers: [],
    kubeConfig: null,
    kubeServices: [],
  };

  const fs = {
    readFile: vi.fn(async (filePath) => {
      if (String(filePath).endsWith("/services.yaml")) return "services";
      if (String(filePath).endsWith("/docker.yaml")) return "docker";
      return "";
    }),
  };

  const yaml = {
    load: vi.fn((contents) => {
      if (contents === "services") return state.servicesYaml;
      if (contents === "docker") return state.dockerYaml;
      return null;
    }),
  };

  const config = {
    CONF_DIR: "/conf",
    getSettings: vi.fn(() => ({ instanceName: undefined })),
    substituteEnvironmentVars: vi.fn((s) => s),
    default: vi.fn(),
  };

  const Docker = vi.fn(() => ({
    listContainers: vi.fn(async () => state.dockerContainers),
    listServices: vi.fn(async () => state.dockerContainers),
  }));

  const dockerCfg = {
    default: vi.fn(() => ({ conn: {} })),
  };

  const kubeCfg = {
    getKubeConfig: vi.fn(() => state.kubeConfig),
  };

  const kubeApi = {
    listIngress: vi.fn(async () => []),
    listTraefikIngress: vi.fn(async () => []),
    listHttpRoute: vi.fn(async () => []),
    isDiscoverable: vi.fn(() => true),
    constructedServiceFromResource: vi.fn(async () => state.kubeServices.shift()),
  };

  return { state, fs, yaml, config, Docker, dockerCfg, kubeCfg, kubeApi };
});

vi.mock("fs", () => ({
  promises: fs,
}));

vi.mock("js-yaml", () => ({
  default: yaml,
  ...yaml,
}));

vi.mock("utils/config/config", () => config);
vi.mock("dockerode", () => ({ default: Docker }));
vi.mock("utils/config/docker", () => dockerCfg);
vi.mock("utils/config/kubernetes", () => kubeCfg);
vi.mock("utils/kubernetes/export", () => ({ default: kubeApi }));

vi.mock("utils/logger", () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe("utils/config/service-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.servicesYaml = null;
    state.dockerYaml = null;
    state.dockerContainers = [];
    state.kubeConfig = null;
    state.kubeServices = [];
  });

  it("findGroupByName deep-searches and annotates parent", async () => {
    const mod = await import("./service-helpers");
    const { findGroupByName } = mod;

    const groups = [
      {
        name: "Parent",
        groups: [{ name: "Child", services: [], groups: [] }],
        services: [],
      },
    ];

    const found = findGroupByName(groups, "Child");
    expect(found.name).toBe("Child");
    expect(found.parent).toBe("Parent");
  });

  it("getServiceItem prefers configured services over docker/kubernetes", async () => {
    // Service present in config -> should return early (no Docker init).
    state.servicesYaml = [{ G: [{ S: { icon: "x" } }] }];

    const mod = await import("./service-helpers");
    const serviceItem = await mod.getServiceItem("G", "S");

    expect(serviceItem).toEqual(expect.objectContaining({ name: "S", type: "service", icon: "x" }));
    expect(Docker).not.toHaveBeenCalled();
    expect(kubeCfg.getKubeConfig).not.toHaveBeenCalled();
  });

  it("getServiceItem falls back to docker then kubernetes", async () => {
    const mod = await import("./service-helpers");

    // Miss in config, hit in Docker.
    state.servicesYaml = [{ G: [{ Other: { icon: "nope" } }] }];
    state.dockerYaml = { "docker-local": {} };
    state.dockerContainers = [
      {
        Names: ["/c1"],
        Labels: {
          "homepage.group": "G",
          "homepage.name": "S",
        },
      },
    ];

    expect(await mod.getServiceItem("G", "S")).toEqual(
      expect.objectContaining({ name: "S", server: "docker-local", container: "c1" }),
    );

    // Miss in config, miss in Docker, hit in Kubernetes.
    vi.resetModules();
    state.servicesYaml = [{ G: [{ Other: { icon: "nope" } }] }];
    state.dockerYaml = { "docker-local": {} };
    state.dockerContainers = [];
    state.kubeConfig = {}; // truthy => proceed
    state.kubeServices = [{ name: "S", group: "G", type: "service" }];
    kubeApi.listIngress.mockResolvedValueOnce([{}]);

    const mod2 = await import("./service-helpers");
    expect(await mod2.getServiceItem("G", "S")).toEqual(expect.objectContaining({ name: "S", type: "service" }));
  });

  it("getServiceWidget returns widget or widgets[index]", async () => {
    state.servicesYaml = [
      {
        G: [
          {
            S: { widget: { id: "single" }, widgets: [{ id: "w0" }, { id: "w1" }] },
          },
        ],
      },
    ];

    const mod = await import("./service-helpers");

    expect(await mod.default("G", "S", -1)).toEqual({ id: "single" });
    expect(await mod.default("G", "S", "1")).toEqual({ id: "w1" });
  });
});
