import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, fs, yaml, config, Docker, dockerCfg, kubeCfg, kubeApi } = vi.hoisted(() => {
  const state = {
    servicesYaml: null,
    dockerYaml: null,
    dockerContainers: [],
    kubeConfig: null,
    kubeServices: [],
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
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
  // Keep a stable logger instance so tests don't depend on module re-imports.
  default: vi.fn(() => state.logger),
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

  it("servicesFromConfig parses nested groups, assigns default weights, and skips invalid entries", async () => {
    state.servicesYaml = [
      {
        Main: [
          {
            Child: [{ SvcA: { icon: "a" } }, { SvcB: { icon: "b", weight: 5 } }],
          },
          { SvcRoot: { icon: "r" } },
          { BadSvc: null },
        ],
      },
    ];

    const mod = await import("./service-helpers");
    const groups = await mod.servicesFromConfig();

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Main");
    expect(groups[0].type).toBe("group");

    // Root services live on the group; child groups are nested.
    expect(groups[0].services.map((s) => ({ name: s.name, weight: s.weight }))).toEqual([
      { name: "SvcRoot", weight: 100 },
    ]);
    expect(groups[0].groups).toHaveLength(1);
    expect(groups[0].groups[0].name).toBe("Child");
    expect(groups[0].groups[0].services.map((s) => ({ name: s.name, weight: s.weight }))).toEqual([
      { name: "SvcA", weight: 100 },
      { name: "SvcB", weight: 5 },
    ]);

    expect(state.logger.warn).toHaveBeenCalled();
  });

  it("cleanServiceGroups normalizes weights, moves widget->widgets, and parses per-widget settings", async () => {
    const mod = await import("./service-helpers");
    const { cleanServiceGroups } = mod;

    const rawGroups = [
      {
        name: "Group",
        services: [
          {
            name: "svc",
            showStats: "true",
            weight: "not-a-number",
            widgets: [
              // Invalid fields/highlight should be dropped with a log message.
              { type: "iframe", fields: "{bad}", highlight: "{bad}", src: "https://example.com" },
              // Type-specific boolean parsing.
              { type: "portainer", kubernetes: "true" },
              { type: "deluge", enableLeechProgress: "true", enableLeechSize: "false" },
            ],
            // `widget` is appended after the `widgets` array.
            widget: {
              type: "glances",
              metric: "cpu",
              chart: false,
              version: "3",
              refreshInterval: 1500,
              pointsLimit: 10,
              diskUnits: "gb",
              fields: '["cpu"]',
              highlight: '{"level":"warning"}',
              hideErrors: true,
            },
          },
          {
            name: "svc2",
            weight: {},
            widget: { type: "openwrt", interfaceName: "eth0" },
          },
        ],
        groups: [],
      },
    ];

    const cleaned = cleanServiceGroups(rawGroups);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].type).toBe("group");
    expect(cleaned[0].services).toHaveLength(2);

    const svc = cleaned[0].services[0];
    expect(svc.showStats).toBe(true);
    expect(svc.weight).toBe(0);
    expect(svc.widgets).toHaveLength(4);

    // The last widget is the appended `widget` entry; it should carry service metadata.
    const glancesWidget = svc.widgets[3];
    expect(glancesWidget.type).toBe("glances");
    expect(glancesWidget.service_group).toBe("Group");
    expect(glancesWidget.service_name).toBe("svc");
    expect(glancesWidget.index).toBe(3);
    expect(glancesWidget.hide_errors).toBe(true);
    expect(glancesWidget.fields).toEqual(["cpu"]);
    expect(glancesWidget.highlight).toEqual({ level: "warning" });
    expect(glancesWidget.chart).toBe(false);
    expect(glancesWidget.version).toBe(3);

    // Type-specific parsing for other widgets.
    expect(svc.widgets[1].kubernetes).toBe(true);
    expect(svc.widgets[2].enableLeechProgress).toBe(true);
    expect(svc.widgets[2].enableLeechSize).toBe(false);

    const svc2 = cleaned[0].services[1];
    expect(svc2.weight).toBe(0);
    expect(svc2.widgets).toHaveLength(1);
    expect(svc2.widgets[0]).toEqual(
      expect.objectContaining({
        type: "openwrt",
        interfaceName: "eth0",
        service_group: "Group",
        service_name: "svc2",
        index: 0,
      }),
    );

    expect(state.logger.error).toHaveBeenCalled();
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
