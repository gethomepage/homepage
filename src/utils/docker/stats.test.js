import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, DockerCtor, getDockerArguments, containersFromConfig, hasHomepageLabels, getSettings } = vi.hoisted(
  () => {
    const state = {
      docker: null,
      containers: [],
      statsById: {},
      dockerArgs: { conn: { socketPath: "/var/run/docker.sock" }, swarm: false },
    };

    function DockerCtor() {
      return state.docker;
    }

    return {
      state,
      DockerCtor,
      getDockerArguments: vi.fn(() => state.dockerArgs),
      containersFromConfig: vi.fn(async () => new Set()),
      hasHomepageLabels: vi.fn(() => false),
      getSettings: vi.fn(() => ({ instanceName: undefined })),
    };
  },
);

vi.mock("dockerode", () => ({ default: DockerCtor }));
vi.mock("utils/config/docker", () => ({ default: getDockerArguments }));
vi.mock("utils/config/service-helpers", () => ({ containersFromConfig, hasHomepageLabels }));
vi.mock("utils/config/config", () => ({ getSettings }));

import { getDockerStats } from "./stats";

// cpu 20%, mem 900, rx 4, tx 6
const rawStats = (overrides = {}) => ({
  cpu_stats: { cpu_usage: { total_usage: 200 }, system_cpu_usage: 2000, online_cpus: 2 },
  precpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 1000 },
  memory_stats: { usage: 1000, total_inactive_file: 100 },
  networks: { eth0: { rx_bytes: 1, tx_bytes: 2 }, eth1: { rx_bytes: 3, tx_bytes: 4 } },
  ...overrides,
});

describe("utils/docker/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: { socketPath: "/var/run/docker.sock" }, swarm: false };
    state.containers = [];
    state.statsById = {};
    state.docker = {
      listContainers: vi.fn(async () => state.containers),
      listServices: vi.fn(async () => []),
      listTasks: vi.fn(async () => []),
      getContainer: vi.fn((id) => ({
        stats: vi.fn(async () => {
          const entry = state.statsById[id];
          if (entry instanceof Error) throw entry;
          if (!entry) throw new Error(`no stats for ${id}`);
          return entry;
        }),
      })),
    };
    containersFromConfig.mockResolvedValue(new Set());
    hasHomepageLabels.mockReturnValue(false);
    getSettings.mockReturnValue({ instanceName: undefined });
  });

  it("returns computed stats for configured running containers", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [{ Names: ["/app"], Id: "cid1", State: "running" }];
    state.statsById.cid1 = rawStats();

    expect(await getDockerStats("local")).toEqual({ stats: { app: { cpu: 20, mem: 900, rx: 4, tx: 6 } } });
    expect(getDockerArguments).toHaveBeenCalledWith("local");
    expect(containersFromConfig).toHaveBeenCalledWith("local");
  });

  it("omits containers that are neither configured nor labelled", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [
      { Names: ["/app"], Id: "cid1", State: "running" },
      { Names: ["/secret-db"], Id: "cid2", State: "running" },
    ];
    state.statsById.cid1 = rawStats();
    state.statsById.cid2 = rawStats();

    const result = await getDockerStats("local");

    expect(Object.keys(result.stats)).toEqual(["app"]);
    expect(state.docker.getContainer).not.toHaveBeenCalledWith("cid2");
  });

  it("includes containers discovered through homepage labels", async () => {
    hasHomepageLabels.mockImplementation((labels) => labels?.["homepage.name"] !== undefined);
    state.containers = [{ Names: ["/labelled"], Id: "cid1", State: "running", Labels: { "homepage.name": "App" } }];
    state.statsById.cid1 = rawStats();

    expect(Object.keys((await getDockerStats("local")).stats)).toEqual(["labelled"]);
  });

  it("does not collect stats for containers that are not running", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [{ Names: ["/app"], Id: "cid1", State: "exited" }];

    expect(await getDockerStats("local")).toEqual({ stats: {} });
    expect(state.docker.getContainer).not.toHaveBeenCalled();
  });

  it("keeps a per container stats failure without failing the rest", async () => {
    containersFromConfig.mockResolvedValue(new Set(["ok", "broken"]));
    state.containers = [
      { Names: ["/ok"], Id: "cid1", State: "running" },
      { Names: ["/broken"], Id: "cid2", State: "running" },
    ];
    state.statsById.cid1 = rawStats();
    state.statsById.cid2 = new Error("stats unavailable");

    expect(await getDockerStats("local")).toEqual({
      stats: { ok: { cpu: 20, mem: 900, rx: 4, tx: 6 }, broken: { error: "stats unavailable" } },
    });
  });

  it("omits mem and network when docker does not report them", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [{ Names: ["/app"], Id: "cid1", State: "running" }];
    state.statsById.cid1 = rawStats({ memory_stats: {}, networks: undefined });

    expect(await getDockerStats("local")).toEqual({ stats: { app: { cpu: 20 } } });
  });

  it("returns an error when docker returns a non-array containers payload", async () => {
    state.containers = Buffer.from("bad");

    expect(await getDockerStats("local")).toEqual({ error: "query failed" });
  });

  it("resolves a swarm service through its local task container", async () => {
    state.dockerArgs.swarm = true;
    containersFromConfig.mockResolvedValue(new Set(["svc"]));
    state.containers = [{ Names: ["/other"], Id: "local1", State: "running" }];
    state.statsById.local1 = rawStats();
    state.docker.listServices.mockResolvedValue([{ ID: "sid", Spec: { Name: "svc" } }]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "remote1" } } },
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "local1" } } },
    ]);

    expect(await getDockerStats("swarm")).toEqual({ stats: { svc: { cpu: 20, mem: 900, rx: 4, tx: 6 } } });
  });

  it("skips a swarm service with no container on this node", async () => {
    state.dockerArgs.swarm = true;
    containersFromConfig.mockResolvedValue(new Set(["svc"]));
    state.containers = [{ Names: ["/other"], Id: "local1", State: "running" }];
    state.docker.listServices.mockResolvedValue([{ ID: "sid", Spec: { Name: "svc" } }]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "remote1" } } },
    ]);

    expect(await getDockerStats("swarm")).toEqual({ stats: {} });
  });

  it("omits swarm services that are neither configured nor labelled", async () => {
    state.dockerArgs.swarm = true;
    state.containers = [{ Names: ["/other"], Id: "local1", State: "running" }];
    state.statsById.local1 = rawStats();
    state.docker.listServices.mockResolvedValue([{ ID: "sid", Spec: { Name: "internal" } }]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "local1" } } },
    ]);

    expect(await getDockerStats("swarm")).toEqual({ stats: {} });
  });
});
