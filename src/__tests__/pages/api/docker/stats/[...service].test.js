import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, DockerCtor, getDockerArguments, logger } = vi.hoisted(() => {
  const state = {
    docker: null,
    dockerArgs: { conn: { socketPath: "/var/run/docker.sock" }, swarm: false },
  };

  function DockerCtor() {
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

import handler from "pages/api/docker/stats/[...service]";

describe("pages/api/docker/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: { socketPath: "/var/run/docker.sock" }, swarm: false };
    state.docker = {
      listContainers: vi.fn(),
      getContainer: vi.fn(),
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

  it("returns stats for an existing container", async () => {
    state.docker.listContainers.mockResolvedValue([{ Names: ["/myapp"], Id: "cid1" }]);
    const containerStats = { cpu_stats: { cpu_usage: { total_usage: 1 } } };
    state.docker.getContainer.mockReturnValue({
      stats: vi.fn().mockResolvedValue(containerStats),
    });

    const req = { query: { service: ["myapp", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stats: containerStats });
  });

  it("uses swarm tasks to locate a container and reports a friendly error when stats cannot be retrieved", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "local1" }]);
    state.docker.listTasks.mockResolvedValue([
      { Status: { ContainerStatus: { ContainerID: "local1" } } },
      { Status: { ContainerStatus: { ContainerID: "remote1" } } },
    ]);
    state.docker.getContainer.mockReturnValue({
      stats: vi.fn().mockRejectedValue(new Error("nope")),
    });

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ error: "Unable to retrieve stats" });
  });

  it("returns stats for a swarm task container when present locally", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "local1" }]);
    state.docker.listTasks.mockResolvedValue([{ Status: { ContainerStatus: { ContainerID: "local1" } } }]);

    const containerStats = { cpu_stats: { cpu_usage: { total_usage: 2 } } };
    state.docker.getContainer.mockReturnValue({
      stats: vi.fn().mockResolvedValue(containerStats),
    });

    const req = { query: { service: ["svc", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stats: containerStats });
  });

  it("returns 404 when no container or swarm task is found", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/other"], Id: "local1" }]);
    state.docker.listTasks.mockResolvedValue([]);

    const req = { query: { service: ["missing", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "not found" });
  });

  it("logs and returns 500 when the docker query throws", async () => {
    getDockerArguments.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const req = { query: { service: ["myapp", "local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: { message: "boom" } });
    expect(logger.error).toHaveBeenCalled();
  });
});
