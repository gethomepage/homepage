import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, getDockerArguments, Docker, logger } = vi.hoisted(() => {
  const state = {
    dockerArgs: { conn: {}, swarm: false },
    listContainersResult: [],
    tasks: [],
    statsByContainer: {},
    throwOnStatsFor: new Set(),
    docker: null,
  };

  const getDockerArguments = vi.fn(() => state.dockerArgs);

  const Docker = vi.fn(() => {
    const docker = {
      listContainers: vi.fn(async () => state.listContainersResult),
      listTasks: vi.fn(async () => state.tasks),
      getContainer: vi.fn((idOrName) => ({
        stats: vi.fn(async () => {
          if (state.throwOnStatsFor.has(idOrName)) throw new Error("nope");
          return state.statsByContainer[idOrName] ?? { ok: true };
        }),
      })),
    };

    state.docker = docker;
    return docker;
  });

  const logger = { error: vi.fn() };

  return { state, getDockerArguments, Docker, logger };
});

vi.mock("dockerode", () => ({ default: Docker }));
vi.mock("utils/config/docker", () => ({ default: getDockerArguments }));
vi.mock("utils/logger", () => ({ default: () => logger }));

import handler from "./[...service]";

describe("pages/api/docker/stats/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: {}, swarm: false };
    state.listContainersResult = [];
    state.tasks = [];
    state.statsByContainer = {};
    state.throwOnStatsFor = new Set();
    state.docker = null;
  });

  it("returns 400 when docker parameters are missing", async () => {
    const req = { query: { service: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("docker query parameters");
  });

  it("returns 500 when docker listContainers returns a non-array", async () => {
    state.listContainersResult = Buffer.from("nope");

    const req = { query: { service: ["c1", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("query failed");
  });

  it("returns container stats when the container exists", async () => {
    state.listContainersResult = [{ Id: "id1", Names: ["/c1"] }];
    state.statsByContainer.c1 = { cpu: 1 };

    const req = { query: { service: ["c1", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(getDockerArguments).toHaveBeenCalledWith("docker-local");
    expect(state.docker.getContainer).toHaveBeenCalledWith("c1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stats: { cpu: 1 } });
  });

  it("falls back to swarm tasks and returns a task container's stats when available", async () => {
    state.dockerArgs = { conn: {}, swarm: true };
    state.listContainersResult = [{ Id: "local1", Names: ["/other"] }];
    state.tasks = [
      { Status: { ContainerStatus: { ContainerID: "local1" } } },
      { Status: { ContainerStatus: { ContainerID: "remote2" } } },
    ];
    state.statsByContainer.local1 = { cpu: 2 };

    const req = { query: { service: ["swarmservice", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toEqual({ cpu: 2 });
  });

  it("returns a 200 error payload when a swarm task exists but stats cannot be retrieved", async () => {
    state.dockerArgs = { conn: {}, swarm: true };
    state.listContainersResult = [{ Id: "local1", Names: ["/other"] }];
    state.tasks = [{ Status: { ContainerStatus: { ContainerID: "local1" } } }];
    state.throwOnStatsFor.add("local1");

    const req = { query: { service: ["swarmservice", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.error).toBe("Unable to retrieve stats");
  });
});
