import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getSettings, httpProxy, logger } = vi.hoisted(() => ({
  getSettings: vi.fn(),
  httpProxy: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("../../../utils/config/config", () => ({
  getSettings,
}));

vi.mock("../../../utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("../../../utils/logger", () => ({
  default: () => logger,
}));

import handler from "./longhorn";

describe("pages/api/widgets/longhorn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the longhorn URL isn't configured", async () => {
    getSettings.mockReturnValueOnce({ providers: { longhorn: {} } });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing Longhorn URL");
  });

  it("parses and aggregates node disk totals, including a total node", async () => {
    getSettings.mockReturnValueOnce({
      providers: { longhorn: { url: "http://lh", username: "u", password: "p" } },
    });

    const payload = {
      data: [
        {
          id: "n1",
          disks: {
            d1: { storageAvailable: 1, storageMaximum: 10, storageReserved: 2, storageScheduled: 3 },
          },
        },
        {
          id: "n2",
          disks: {
            d1: { storageAvailable: 4, storageMaximum: 20, storageReserved: 5, storageScheduled: 6 },
            d2: { storageAvailable: 1, storageMaximum: 1, storageReserved: 1, storageScheduled: 1 },
          },
        },
      ],
    };

    httpProxy.mockResolvedValueOnce([200, "application/json", JSON.stringify(payload)]);

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.headers["Content-Type"]).toBe("application/json");
    expect(res.statusCode).toBe(200);

    const nodes = res.body.nodes;
    expect(nodes.map((n) => n.id)).toEqual(["n1", "n2", "total"]);
    expect(nodes.find((n) => n.id === "total")).toEqual(
      expect.objectContaining({
        id: "total",
        available: 6,
        maximum: 31,
        reserved: 8,
        scheduled: 10,
      }),
    );
  });
});
