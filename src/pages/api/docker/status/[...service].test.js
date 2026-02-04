import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { state, getDockerArguments, Docker, logger } = vi.hoisted(() => {
  const state = {
    dockerArgs: { conn: {}, swarm: false },
    listContainersResult: [],
    tasks: [],
    inspectByContainer: {},
    serviceInfo: undefined,
    docker: null,
  };

  const getDockerArguments = vi.fn(() => state.dockerArgs);

  const Docker = vi.fn(() => {
    const docker = {
      listContainers: vi.fn(async () => state.listContainersResult),
      listTasks: vi.fn(async () => state.tasks),
      getContainer: vi.fn((idOrName) => ({
        inspect: vi.fn(async () => state.inspectByContainer[idOrName]),
      })),
      getService: vi.fn(() => ({
        inspect: vi.fn(async () => state.serviceInfo),
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

describe("pages/api/docker/status/[...service]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dockerArgs = { conn: {}, swarm: false };
    state.listContainersResult = [];
    state.tasks = [];
    state.inspectByContainer = {};
    state.serviceInfo = undefined;
    state.docker = null;
  });

  it("returns 400 when docker parameters are missing", async () => {
    const req = { query: { service: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("docker query parameters");
  });

  it("returns status/health when the container exists", async () => {
    state.listContainersResult = [{ Id: "id1", Names: ["/c1"] }];
    state.inspectByContainer.c1 = { State: { Status: "running", Health: { Status: "healthy" } } };

    const req = { query: { service: ["c1", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "running", health: "healthy" });
  });

  it("returns replicated swarm service status based on task count", async () => {
    state.dockerArgs = { conn: {}, swarm: true };
    state.listContainersResult = [{ Id: "id1", Names: ["/other"] }];
    state.serviceInfo = { Spec: { Mode: { Replicated: { Replicas: "3" } } } };
    state.tasks = [{}, {}, {}];

    const req = { query: { service: ["svc", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("running 3/3");
  });

  it("returns global swarm service status from a local task container when available", async () => {
    state.dockerArgs = { conn: {}, swarm: true };
    state.listContainersResult = [{ Id: "local1", Names: ["/other"] }];
    state.serviceInfo = { Spec: { Mode: {} } };
    state.tasks = [{ Status: { ContainerStatus: { ContainerID: "local1" }, State: "running" } }];
    state.inspectByContainer.local1 = { State: { Status: "running" } };

    const req = { query: { service: ["svc", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("running");
  });

  it("returns 404 when no container/service is found", async () => {
    state.dockerArgs = { conn: {}, swarm: false };
    state.listContainersResult = [{ Id: "id1", Names: ["/other"] }];

    const req = { query: { service: ["missing", "docker-local"] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("not found");
  });
});
