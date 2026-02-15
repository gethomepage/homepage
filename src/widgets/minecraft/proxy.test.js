import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { mc, getServiceWidget, logger } = vi.hoisted(() => ({
  mc: { lookup: vi.fn() },
  getServiceWidget: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("minecraftstatuspinger", () => ({
  default: mc,
  ...mc,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import minecraftProxyHandler from "./proxy";

describe("widgets/minecraft/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns online=true with version and player data when lookup succeeds", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://example.com:25565" });
    mc.lookup.mockResolvedValue({
      status: {
        version: { name: "1.20" },
        players: { online: 1, max: 10 },
      },
    });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await minecraftProxyHandler(req, res);

    expect(mc.lookup).toHaveBeenCalledWith({ host: "example.com", port: "25565" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      version: "1.20",
      online: true,
      players: { online: 1, max: 10 },
    });
  });

  it("returns online=false when lookup fails", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://example.com:25565" });
    mc.lookup.mockRejectedValue(new Error("nope"));

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await minecraftProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ version: undefined, online: false, players: undefined });
  });
});
