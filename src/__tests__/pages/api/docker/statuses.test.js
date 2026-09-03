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

import handler from "pages/api/docker/statuses";

describe("pages/api/docker/statuses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: { socketPath: "/var/run/docker.sock" }, swarm: false };
    state.docker = {
      listContainers: vi.fn(),
      listServices: vi.fn(),
      listTasks: vi.fn(),
    };
  });

  it("returns every container status from a single listContainers call", async () => {
    state.docker.listContainers.mockResolvedValue([
      { Names: ["/glance"], State: "running", Status: "Up 2 hours (healthy)" },
      { Names: ["/share"], State: "exited", Status: "Exited (0) 1 hour ago" },
    ]);

    const req = { query: { server: "local" } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerArguments).toHaveBeenCalledWith("local");
    expect(state.docker.listContainers).toHaveBeenCalledTimes(1);
    expect(state.docker.listServices).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      glance: { status: "running", health: "healthy" },
      share: { status: "exited" },
    });
  });

  it("includes swarm services when the server is in swarm mode", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/web"], Id: "cid1", State: "running", Status: "Up" }]);
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
      web: { status: "running" },
      api: { status: "running 2/2" },
    });
  });

  it("returns only listed containers when swarm queries fail", async () => {
    state.dockerArgs.swarm = true;
    state.docker.listContainers.mockResolvedValue([{ Names: ["/web"], Id: "cid1", State: "running", Status: "Up" }]);
    state.docker.listServices.mockRejectedValue(new Error("no services"));
    state.docker.listTasks.mockRejectedValue(new Error("no tasks"));

    const req = { query: { server: "swarm" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ web: { status: "running" } });
  });

  it("returns 500 when docker returns a non-array containers payload", async () => {
    state.docker.listContainers.mockResolvedValue(Buffer.from("bad"));

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
