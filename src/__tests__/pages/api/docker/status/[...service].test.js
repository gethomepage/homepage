import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, DockerCtor, getDockerArguments, logger } = vi.hoisted(() => {
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
    logger: { error: vi.fn() },
  };
});

vi.mock("dockerode", () => ({
  default: DockerCtor,
}));

vi.mock("utils/config/docker", () => ({
  default: getDockerArguments,
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
    state.docker = {
      listContainers: vi.fn(),
      getContainer: vi.fn(),
      getService: vi.fn(),
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

  it("inspects an existing container and returns status + health", async () => {
    state.docker.listContainers.mockResolvedValue([{ Names: ["/myapp"], Id: "cid1" }]);
    state.docker.getContainer.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ State: { Status: "running", Health: { Status: "healthy" } } }),
    });

    const req = { query: { service: ["myapp", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerArguments).toHaveBeenCalledWith("local");
    expect(state.dockerCtorArgs).toHaveLength(1);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", health: "healthy" });
  });

  it("returns 404 when container does not exist and swarm is disabled", async () => {
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1" }]);

    const req = { query: { service: ["missing", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ status: "not found" });
  });

  it("reports replicated swarm service status based on desired replicas", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1" }]);
    state.docker.getService.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ Spec: { Mode: { Replicated: { Replicas: "2" } } } }),
    });
    state.docker.listTasks.mockResolvedValue([{ Status: {} }, { Status: {} }]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running 2/2" });
  });

  it("reports partial status for replicated services with fewer running tasks", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1" }]);
    state.docker.getService.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ Spec: { Mode: { Replicated: { Replicas: "3" } } } }),
    });
    state.docker.listTasks.mockResolvedValue([{ Status: {} }]);

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "partial 1/3" });
  });

  it("handles global services by inspecting a local task container when possible", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "local1" }]);
    state.docker.getService.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ Spec: { Mode: { Global: {} } } }),
    });
    state.docker.listTasks.mockResolvedValue([
      { Status: { ContainerStatus: { ContainerID: "local1" }, State: "running" } },
    ]);
    state.docker.getContainer.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ State: { Status: "running", Health: { Status: "unhealthy" } } }),
    });

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", health: "unhealthy" });
  });

  it("falls back to task status when global service container inspect fails", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "local1" }]);
    state.docker.getService.mockReturnValue({
      inspect: vi.fn().mockResolvedValue({ Spec: { Mode: { Global: {} } } }),
    });
    state.docker.listTasks.mockResolvedValue([
      { Status: { ContainerStatus: { ContainerID: "local1" }, State: "pending" } },
    ]);
    state.docker.getContainer.mockReturnValue({
      inspect: vi.fn().mockRejectedValue(new Error("nope")),
    });

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "pending" });
  });

  it("returns 404 when swarm is enabled but the service does not exist", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "cid1" }]);
    state.docker.getService.mockReturnValue({
      inspect: vi.fn().mockRejectedValue(new Error("not found")),
    });

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
