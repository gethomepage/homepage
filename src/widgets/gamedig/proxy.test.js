import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { GameDig, getServiceWidget, logger } = vi.hoisted(() => ({
  GameDig: { query: vi.fn() },
  getServiceWidget: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("gamedig", () => ({
  GameDig,
}));
vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));
vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import gamedigProxyHandler from "./proxy";

describe("widgets/gamedig/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns online=true with server details when query succeeds", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://example.com:1234", serverType: "csgo" });
    GameDig.query.mockResolvedValue({
      name: "Server",
      map: "de_dust2",
      numplayers: 3,
      maxplayers: 10,
      bots: [],
      ping: 42,
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await gamedigProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        online: true,
        name: "Server",
        players: 3,
        maxplayers: 10,
      }),
    );
  });

  it("returns online=false when query fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://example.com:1234", serverType: "csgo" });
    GameDig.query.mockRejectedValue(new Error("nope"));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await gamedigProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ online: false });
  });
});
