import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { RconConnect, rconInstance, getServiceWidget, logger } = vi.hoisted(() => ({
  RconConnect: vi.fn(),
  rconInstance: { send: vi.fn(), end: vi.fn() },
  getServiceWidget: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("rcon-client", () => ({
  Rcon: { connect: RconConnect },
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import factorioProxyHandler from "./proxy";

describe("widgets/factorio/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RconConnect.mockResolvedValue(rconInstance);
  });

  it("returns online=true with player count and tick when the query succeeds", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://127.0.0.1:27015", password: "secret" });
    rconInstance.send.mockResolvedValue(JSON.stringify({ tick: 12000, players: 3 }));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await factorioProxyHandler(req, res);

    expect(RconConnect).toHaveBeenCalledWith({ host: "127.0.0.1", port: 27015, password: "secret" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ online: true, tick: 12000, players: 3 });
    expect(rconInstance.end).toHaveBeenCalled();
  });

  it("returns online=false when the RCON connection fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://127.0.0.1:27015", password: "wrong" });
    RconConnect.mockRejectedValue(new Error("Authentication failed"));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await factorioProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ online: false });
    expect(logger.error).toHaveBeenCalled();
  });
});
