import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, fs, yaml, config, Docker, dockerCfg, kubeCfg, kubeApi } = vi.hoisted(() => {
  const state = {
    servicesYaml: null,
    dockerYaml: null,
    dockerContainers: [],
    dockerContainersByServer: {},
    dockerServicesByServer: {},
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

  const Docker = vi.fn((conn) => ({
    listContainers: vi.fn(async () => state.dockerContainersByServer[conn?.serverName] ?? state.dockerContainers),
    listServices: vi.fn(async () => state.dockerServicesByServer[conn?.serverName] ?? state.dockerContainers),
  }));

  const dockerCfg = {
    default: vi.fn((serverName) => ({ conn: { serverName } })),
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
    state.dockerContainersByServer = {};
    state.dockerServicesByServer = {};
    state.kubeConfig = null;
    state.kubeServices = [];
    config.getSettings.mockReturnValue({ instanceName: undefined });
  });

  it("servicesFromConfig returns [] when services.yaml is empty", async () => {
    state.servicesYaml = null;

    const mod = await import("./service-helpers");
    expect(await mod.servicesFromConfig()).toEqual([]);
  });

  it("servicesFromDocker returns [] when docker.yaml is empty", async () => {
    state.dockerYaml = null;

    const mod = await import("./service-helpers");
    expect(await mod.servicesFromDocker()).toEqual([]);
  });

  it("servicesFromDocker tolerates non-array container responses from Docker", async () => {
    state.dockerYaml = { "docker-local": {} };
    state.dockerContainersByServer["docker-local"] = Buffer.from("bad docker response");

    const mod = await import("./service-helpers");
    const discovered = await mod.servicesFromDocker();

    expect(discovered).toEqual([]);
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
          {
            name: "svc3",
            weight: "7",
            widget: { type: "frigate", enableRecentEvents: true },
          },
        ],
        groups: [],
      },
    ];

    const cleaned = cleanServiceGroups(rawGroups);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].type).toBe("group");
    expect(cleaned[0].services).toHaveLength(3);

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

    const svc3 = cleaned[0].services[2];
    expect(svc3.weight).toBe(7);
    expect(svc3.widgets[0]).toEqual(expect.objectContaining({ type: "frigate", enableRecentEvents: true }));

    expect(state.logger.error).toHaveBeenCalled();
  });

  it("cleanServiceGroups applies widget-type specific mappings for commonly used widgets", async () => {
    const mod = await import("./service-helpers");
    const { cleanServiceGroups } = mod;

    const rawGroups = [
      {
        name: "Core",
        services: [
          {
            name: "svc",
            weight: 100,
            widgets: [
              { type: "azuredevops", userEmail: "u@example.com", repositoryId: "r" },
              { type: "beszel", version: "2", systemId: "sys" },
              { type: "coinmarketcap", currency: "USD", symbols: "BTC", slugs: "bitcoin", defaultinterval: "1d" },
              { type: "crowdsec", limit24h: "true" },
              { type: "docker", server: "docker-local", container: "c1" },
              { type: "unifi", site: "Home" },
              { type: "proxmox", node: "pve" },
              { type: "proxmoxbackupserver", datastore: "ds" },
              { type: "komodo", showSummary: "true", showStacks: "false" },
              { type: "kubernetes", namespace: "default", app: "app", podSelector: "app=test" },
              {
                type: "iframe",
                src: "https://example.com",
                allowFullscreen: true,
                allowPolicy: "geolocation",
                allowScrolling: false,
                classes: "x",
                loadingStrategy: "lazy",
                referrerPolicy: "no-referrer",
                refreshInterval: 1000,
              },
              { type: "qbittorrent", enableLeechProgress: "true", enableLeechSize: "true" },
              { type: "opnsense", wan: "wan1" },
              { type: "emby", enableBlocks: "true", enableNowPlaying: "false", enableMediaControl: "true" },
              { type: "tautulli", expandOneStreamToTwoRows: "true", showEpisodeNumber: "true", enableUser: "true" },
              { type: "radarr", enableQueue: "true" },
              { type: "truenas", enablePools: "true", nasType: "scale" },
              { type: "qnap", volume: "vol1" },
              { type: "dispatcharr", enableActiveStreams: "true" },
              { type: "gamedig", gameToken: "t" },
              { type: "kopia", snapshotHost: "h", snapshotPath: "/p" },
              { type: "glances", version: "4", metric: "cpu", refreshInterval: 2000, pointsLimit: 5, diskUnits: "gb" },
              { type: "mjpeg", stream: "s", fit: "contain" },
              { type: "openmediavault", method: "foo.bar" },
              { type: "customapi", mappings: { x: 1 }, display: { y: 2 }, refreshInterval: 5000 },
              {
                type: "calendar",
                integrations: [],
                firstDayInWeek: "monday",
                view: "agenda",
                maxEvents: 10,
                previousDays: 2,
                showTime: true,
                timezone: "UTC",
              },
              { type: "dockhand", environment: "prod" },
              { type: "hdhomerun", tuner: 1 },
              { type: "healthchecks", uuid: "u" },
              { type: "speedtest", bitratePrecision: "3", version: "1" },
              { type: "stocks", watchlist: "AAPL", showUSMarketStatus: true },
              { type: "wgeasy", threshold: "10", version: "1" },
              { type: "technitium", range: "24h" },
              { type: "lubelogger", vehicleID: "12" },
              { type: "vikunja", enableTaskList: true, version: "1" },
              { type: "prometheusmetric", metrics: [], refreshInterval: 2500 },
              { type: "spoolman", spoolIds: [1, 2] },
              { type: "jellystat", days: "7" },
              { type: "grafana", alerts: [] },
              { type: "unraid", pool1: "a", pool2: "b", pool3: "c", pool4: "d" },
              { type: "yourspotify", interval: "daily" },
            ],
          },
        ],
        groups: [],
      },
    ];

    const cleaned = cleanServiceGroups(rawGroups);
    const widgets = cleaned[0].services[0].widgets;

    expect(widgets.find((w) => w.type === "azuredevops")).toEqual(
      expect.objectContaining({ userEmail: "u@example.com", repositoryId: "r" }),
    );
    expect(widgets.find((w) => w.type === "beszel")).toEqual(expect.objectContaining({ version: 2, systemId: "sys" }));
    expect(widgets.find((w) => w.type === "crowdsec")).toEqual(expect.objectContaining({ limit24h: true }));
    expect(widgets.find((w) => w.type === "docker")).toEqual(
      expect.objectContaining({ server: "docker-local", container: "c1" }),
    );
    expect(widgets.find((w) => w.type === "komodo")).toEqual(
      expect.objectContaining({ showSummary: true, showStacks: false }),
    );
    expect(widgets.find((w) => w.type === "kubernetes")).toEqual(
      expect.objectContaining({ namespace: "default", app: "app", podSelector: "app=test" }),
    );
    expect(widgets.find((w) => w.type === "qnap")).toEqual(expect.objectContaining({ volume: "vol1" }));
    expect(widgets.find((w) => w.type === "speedtest")).toEqual(
      expect.objectContaining({ bitratePrecision: 3, version: 1 }),
    );
    expect(widgets.find((w) => w.type === "jellystat")).toEqual(expect.objectContaining({ days: 7 }));
    expect(widgets.find((w) => w.type === "lubelogger")).toEqual(expect.objectContaining({ vehicleID: 12 }));
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

  it("getServiceItem returns false when the service cannot be found anywhere", async () => {
    state.servicesYaml = null;
    state.dockerYaml = null;
    state.kubeConfig = null;

    const mod = await import("./service-helpers");
    expect(await mod.getServiceItem("MissingGroup", "MissingService")).toBe(false);
  });

  it("getServiceWidget returns false when the widget cannot be found", async () => {
    state.servicesYaml = null;
    state.dockerYaml = null;
    state.kubeConfig = null;

    const mod = await import("./service-helpers");
    expect(await mod.default("MissingGroup", "MissingService", 0)).toBe(false);
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

  it("servicesFromDocker maps homepage labels to groups, filters instance-scoped labels, and parses widget version", async () => {
    config.getSettings.mockReturnValue({ instanceName: "foo" });

    state.dockerYaml = {
      "docker-local": {},
      "docker-swarm": { swarm: true },
    };

    state.dockerContainersByServer["docker-local"] = [
      {
        Names: ["/c1"],
        Labels: {
          "homepage.group": "G",
          "homepage.name": "Svc",
          "homepage.href": "http://svc",
          "homepage.widget.version": "3",
          "homepage.instance.foo.description": "Desc",
          "homepage.instance.bar.description": "Ignore",
        },
      },
      // Missing required labels -> should be skipped with an error.
      {
        Names: ["/bad"],
        Labels: {
          "homepage.group": "G",
        },
      },
    ];

    state.dockerServicesByServer["docker-swarm"] = [
      // Swarm service label format.
      {
        Spec: {
          Name: "swarm1",
          Labels: {
            "homepage.group": "G2",
            "homepage.name": "SwarmSvc",
            "homepage.widgets[0].version": "2",
          },
        },
      },
    ];

    const mod = await import("./service-helpers");
    const discoveredGroups = await mod.servicesFromDocker();

    expect(discoveredGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "G",
          services: [
            expect.objectContaining({
              name: "Svc",
              server: "docker-local",
              container: "c1",
              href: "http://svc",
              description: "Desc",
              widget: { version: 3 },
            }),
          ],
        }),
        expect.objectContaining({
          name: "G2",
          services: [
            expect.objectContaining({
              name: "SwarmSvc",
              server: "docker-swarm",
              container: "swarm1",
              widgets: [{ version: 2 }],
            }),
          ],
        }),
      ]),
    );

    // The instance.bar.* labels should be ignored when instanceName=foo.
    expect(JSON.stringify(discoveredGroups)).not.toContain("Ignore");
    expect(state.logger.error).toHaveBeenCalled();
  });

  it("servicesFromDocker tolerates per-server failures and still returns other results", async () => {
    state.dockerYaml = { "docker-a": {}, "docker-b": {} };

    Docker.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    state.dockerContainers = [{ Names: ["/c1"], Labels: { "homepage.group": "G", "homepage.name": "Svc" } }];

    const mod = await import("./service-helpers");
    const discoveredGroups = await mod.servicesFromDocker();

    expect(discoveredGroups).toEqual([
      { name: "G", services: [expect.objectContaining({ name: "Svc", container: "c1" })] },
    ]);
    expect(["docker-a", "docker-b"]).toContain(discoveredGroups[0].services[0].server);
    expect(state.logger.error).toHaveBeenCalled();
  });

  it("servicesFromKubernetes returns [] when kubernetes is not configured", async () => {
    state.kubeConfig = null;

    const mod = await import("./service-helpers");
    expect(await mod.servicesFromKubernetes()).toEqual([]);
  });

  it("servicesFromKubernetes maps discoverable resources into service groups", async () => {
    config.getSettings.mockReturnValue({ instanceName: "foo" });
    state.kubeConfig = {}; // truthy
    kubeApi.listIngress.mockResolvedValueOnce([{ kind: "Ingress" }]);
    kubeApi.isDiscoverable.mockReturnValueOnce(true);
    state.kubeServices = [{ name: "S", group: "G", type: "service", href: "http://k" }];

    const mod = await import("./service-helpers");
    const groups = await mod.servicesFromKubernetes();

    expect(groups).toEqual([
      {
        name: "G",
        services: [{ name: "S", type: "service", href: "http://k" }],
      },
    ]);
    expect(kubeApi.isDiscoverable).toHaveBeenCalledWith({ kind: "Ingress" }, "foo");
  });

  it("servicesFromKubernetes logs and rethrows unexpected errors", async () => {
    state.kubeConfig = {}; // truthy
    kubeApi.listIngress.mockRejectedValueOnce(new Error("boom"));

    const mod = await import("./service-helpers");
    await expect(mod.servicesFromKubernetes()).rejects.toThrow("boom");
    expect(state.logger.error).toHaveBeenCalled();
  });
});
