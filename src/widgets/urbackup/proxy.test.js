import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { UrbackupServer, state, getServiceWidget } = vi.hoisted(() => {
  const state = { instances: [] };

  const UrbackupServer = vi.fn((opts) => {
    const instance = {
      opts,
      getStatus: vi.fn(),
      getUsage: vi.fn(),
    };
    state.instances.push(instance);
    return instance;
  });

  return {
    UrbackupServer,
    state,
    getServiceWidget: vi.fn(),
  };
});

vi.mock("urbackup-server-api", () => ({
  UrbackupServer,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

import urbackupProxyHandler from "./proxy";

describe("widgets/urbackup/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.instances.length = 0;
  });

  it("returns client statuses and maxDays without disk usage by default", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://ur",
      username: "u",
      password: "p",
      maxDays: 5,
    });

    UrbackupServer.mockImplementationOnce((opts) => {
      const instance = {
        opts,
        getStatus: vi.fn().mockResolvedValue([{ id: 1 }]),
        getUsage: vi.fn(),
      };
      state.instances.push(instance);
      return instance;
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    expect(UrbackupServer).toHaveBeenCalledWith({ url: "http://ur", username: "u", password: "p" });
    expect(state.instances[0].getUsage).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ clientStatuses: [{ id: 1 }], diskUsage: false, maxDays: 5 });
  });

  it("fetches disk usage when requested via fields", async () => {
    getServiceWidget.mockResolvedValue({
      url: "http://ur",
      username: "u",
      password: "p",
      maxDays: 1,
      fields: ["totalUsed"],
    });

    UrbackupServer.mockImplementationOnce((opts) => {
      const instance = {
        opts,
        getStatus: vi.fn().mockResolvedValue([{ id: 1 }]),
        getUsage: vi.fn().mockResolvedValue({ totalUsed: 123 }),
      };
      state.instances.push(instance);
      return instance;
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    expect(state.instances[0].getUsage).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.diskUsage).toEqual({ totalUsed: 123 });
  });

  it("returns 500 on server errors", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://ur", username: "u", password: "p" });

    UrbackupServer.mockImplementationOnce((opts) => {
      const instance = {
        opts,
        getStatus: vi.fn().mockRejectedValue(new Error("nope")),
        getUsage: vi.fn(),
      };
      state.instances.push(instance);
      return instance;
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await urbackupProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Error communicating with UrBackup server" });
  });
});
