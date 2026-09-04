import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, DockerCtor, getDockerArguments, containersFromConfig, hasHomepageLabels, getSettings, logger } =
  vi.hoisted(() => {
    const state = {
      docker: null,
      dockerCtorArgs: [],
      dockerArgs: { conn: { socketPath: "/var/run/docker.sock" }, swarm: false },
    };

    function DockerCtor(conn) {
      state.dockerCtorArgs.push(conn);
      return state.docker;
    }

    return {
      state,
      DockerCtor,
      getDockerArguments: vi.fn(() => state.dockerArgs),
      containersFromConfig: vi.fn(async () => new Set()),
      hasHomepageLabels: vi.fn(() => true),
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

import handler from "pages/api/docker/status/[...service]";

describe("pages/api/docker/status/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerCtorArgs.length = 0;
    state.dockerArgs = { conn: { socketPath: "/var/run/docker.sock" }, swarm: false };
    containersFromConfig.mockResolvedValue(new Set());
    hasHomepageLabels.mockReturnValue(true);
    getSettings.mockReturnValue({ instanceName: undefined });
    state.docker = {
      listContainers: vi.fn(),
      listServices: vi.fn(),
      listTasks: vi.fn(),
    };
  });

  it("returns 400 when container name/server params are missing", async () => {
    const req = { query: { service: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "docker query parameters are required" });
  });

  it("returns 500 when docker returns a non-array containers payload", async () => {
    state.docker.listContainers.mockResolvedValue(Buffer.from("bad"));

    const req = { query: { service: ["c", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "query failed" });
  });

  it("returns status + health from a single listContainers call", async () => {
    state.docker.listContainers.mockResolvedValue([
      { Names: ["/myapp"], State: "running", Status: "Up 3 minutes (healthy)" },
    ]);

    const req = { query: { service: ["myapp", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerArguments).toHaveBeenCalledWith("local");
    expect(state.dockerCtorArgs).toHaveLength(1);
    expect(state.docker.listContainers).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", health: "healthy" });
  });

  it("returns 404 for a container that is not configured or labelled for homepage", async () => {
    containersFromConfig.mockResolvedValue(new Set());
    hasHomepageLabels.mockReturnValue(false);
    state.docker.listContainers.mockResolvedValue([{ Names: ["/secret-db"], State: "running", Status: "Up" }]);

    const req = { query: { service: ["secret-db", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ status: "not found" });
  });

  it("returns 404 when container does not exist and swarm is disabled", async () => {
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], State: "running", Status: "Up" }]);

    const req = { query: { service: ["missing", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ status: "not found" });
  });

  it("reports replicated swarm service status based on desired replicas", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1", State: "running", Status: "Up" }]);
    state.docker.listServices.mockResolvedValue([
      { ID: "sid", Spec: { Name: "svc", Mode: { Replicated: { Replicas: "2" } } } },
    ]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: {} },
      { ServiceID: "sid", Status: {} },
    ]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running 2/2" });
  });

  it("reports partial status for replicated services with fewer running tasks", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1", State: "running", Status: "Up" }]);
    state.docker.listServices.mockResolvedValue([
      { ID: "sid", Spec: { Name: "svc", Mode: { Replicated: { Replicas: "3" } } } },
    ]);
    state.docker.listTasks.mockResolvedValue([{ ServiceID: "sid", Status: {} }]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "partial 1/3" });
  });

  it("handles global services from a locally listed task container", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([
      { Names: ["/other"], Id: "local1", State: "running", Status: "Up 1 minute (unhealthy)" },
    ]);
    state.docker.listServices.mockResolvedValue([{ ID: "sid", Spec: { Name: "svc", Mode: { Global: {} } } }]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "local1" }, State: "running" } },
    ]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", health: "unhealthy" });
  });

  it("falls back to task status when a global service container is not listed", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([
      { Names: ["/other"], Id: "otherid", State: "exited", Status: "Exited" },
    ]);
    state.docker.listServices.mockResolvedValue([{ ID: "sid", Spec: { Name: "svc", Mode: { Global: {} } } }]);
    state.docker.listTasks.mockResolvedValue([
      { ServiceID: "sid", Status: { ContainerStatus: { ContainerID: "remote1" }, State: "pending" } },
    ]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "pending" });
  });

  it("returns 404 when swarm is enabled but the service does not exist", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1", State: "running", Status: "Up" }]);
    state.docker.listServices.mockResolvedValue([]);
    state.docker.listTasks.mockResolvedValue([]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ status: "not found" });
  });

  it("logs and returns 500 when the docker query throws", async () => {
    getDockerArguments.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "boom" } });
    expect(logger.error).toHaveBeenCalled();
  });
});
