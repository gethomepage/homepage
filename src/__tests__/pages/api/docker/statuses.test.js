import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, DockerCtor, getDockerArguments, containersFromConfig, hasHomepageLabels, getSettings, logger } =
  vi.hoisted(() => {
    const state = {
      docker: null,
      containers: [],
      health: {},
      containers: [],
      health: {},
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
      logger: { error: vi.fn() },
    };
  });

vi.mock("dockerode", () => ({
  default: DockerCtor,
}));

vi.mock("utils/config/docker", () => ({
  default: getDockerArguments,
}));

vi.mock("utils/config/service-helpers", () => ({
  containersFromConfig,
  hasHomepageLabels,
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/docker/statuses";

describe("pages/api/docker/statuses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: { socketPath: "/var/run/docker.sock" }, swarm: false };
    state.containers = [];
    state.health = {};
    state.docker = {
      listContainers: vi.fn(async (options) => {
        const health = options?.filters?.health?.[0];
        return health ? (state.health[health] ?? []) : state.containers;
      }),
      listServices: vi.fn(),
      listTasks: vi.fn(),
    };
    containersFromConfig.mockResolvedValue(new Set());
    hasHomepageLabels.mockReturnValue(false);
    getSettings.mockReturnValue({ instanceName: undefined });
  });

  it("returns configured container statuses with health from the docker health filters", async () => {
    containersFromConfig.mockResolvedValue(new Set(["glance", "share"]));
    state.containers = [
      { Names: ["/glance"], Id: "cid-glance", State: "running" },
      { Names: ["/share"], Id: "cid-share", State: "exited" },
    ];
    state.health = { healthy: [{ Id: "cid-glance" }] };

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerArguments).toHaveBeenCalledWith("local");
    expect(containersFromConfig).toHaveBeenCalledWith("local");
    // one list plus one per health state, constant regardless of container count
    expect(state.docker.listContainers).toHaveBeenCalledTimes(4);
    expect(state.docker.listServices).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      statuses: {
        glance: { status: "running", health: "healthy" },
        share: { status: "exited" },
      },
    });
  });

  it("takes health from the filter results rather than the status string", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [{ Names: ["/app"], Id: "cid1", State: "running", Status: "Up 2 hours (healthy)" }];
    state.health = { unhealthy: [{ Id: "cid1" }] };

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: { app: { status: "running", health: "unhealthy" } } });
  });

  it("omits health when the docker daemon rejects the health filter", async () => {
    containersFromConfig.mockResolvedValue(new Set(["app"]));
    state.containers = [{ Names: ["/app"], Id: "cid1", State: "running", Status: "Up 2 hours (healthy)" }];
    state.docker.listContainers.mockImplementation(async (options) => {
      if (options?.filters?.health) throw new Error("filter unsupported");
      return state.containers;
    });

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: { app: { status: "running" } } });
  });

  it("omits containers that are neither configured nor labelled for homepage", async () => {
    containersFromConfig.mockResolvedValue(new Set(["glance"]));
    state.containers = [
      { Names: ["/glance"], State: "running", Status: "Up" },
      { Names: ["/secret-db"], State: "running", Status: "Up" },
    ];

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: { glance: { status: "running" } } });
    expect(res.body.statuses["secret-db"]).toBeUndefined();
  });

  it("includes containers discovered through homepage labels", async () => {
    hasHomepageLabels.mockImplementation((labels) => labels?.["homepage.name"] !== undefined);
    state.containers = [
      { Names: ["/labelled"], State: "running", Status: "Up", Labels: { "homepage.name": "App" } },
      { Names: ["/unlabelled"], State: "running", Status: "Up", Labels: {} },
    ];

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: { labelled: { status: "running" } } });
  });

  it("includes swarm services when the server is in swarm mode", async () => {
    state.dockerArgs.swarm = true;
    containersFromConfig.mockResolvedValue(new Set(["web", "api"]));
    state.containers = [{ Names: ["/web"], Id: "cid1", State: "running", Status: "Up" }];
    state.docker.listServices.mockResolvedValue([
      { ID: "sid", Spec: { Name: "api", Mode: { Replicated: { Replicas: "2" } } } },
    ]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: {} },
      { ServiceID: "sid", Status: {} },
    ]);

    const req = { query: { server: "swarm" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      statuses: {
        web: { status: "running" },
        api: { status: "running 2/2" },
      },
    });
  });

  it("omits swarm services that are neither configured nor labelled", async () => {
    state.dockerArgs.swarm = true;
    containersFromConfig.mockResolvedValue(new Set());
    state.containers = [];
    state.docker.listServices.mockResolvedValue([
      { ID: "sid", Spec: { Name: "internal", Mode: { Replicated: { Replicas: "1" } } } },
    ]);
    state.docker.listTasks.mockResolvedValue([{ ServiceID: "sid", Status: {} }]);

    const req = { query: { server: "swarm" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: {} });
  });

  it("includes swarm services discovered through homepage labels", async () => {
    state.dockerArgs.swarm = true;
    hasHomepageLabels.mockImplementation((labels) => labels?.["homepage.name"] !== undefined);
    state.containers = [];
    state.docker.listServices.mockResolvedValue([
      {
        ID: "sid",
        Spec: { Name: "api", Labels: { "homepage.name": "Api" }, Mode: { Replicated: { Replicas: "1" } } },
      },
    ]);
    state.docker.listTasks.mockResolvedValue([{ ServiceID: "sid", Status: {} }]);

    const req = { query: { server: "swarm" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ statuses: { api: { status: "running 1/1" } } });
  });

  it("returns only listed containers when swarm queries fail", async () => {
    state.dockerArgs.swarm = true;
    containersFromConfig.mockResolvedValue(new Set(["web"]));
    state.containers = [{ Names: ["/web"], Id: "cid1", State: "running", Status: "Up" }];
    state.docker.listServices.mockRejectedValue(new Error("no services"));
    state.docker.listTasks.mockRejectedValue(new Error("no tasks"));

    const req = { query: { server: "swarm" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ statuses: { web: { status: "running" } } });
  });

  it("returns 500 when docker returns a non-array containers payload", async () => {
    state.containers = Buffer.from("bad");

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "query failed" });
  });

  it("logs and returns 500 when the docker query throws", async () => {
    getDockerArguments.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "boom" } });
    expect(logger.error).toHaveBeenCalled();
  });
});
