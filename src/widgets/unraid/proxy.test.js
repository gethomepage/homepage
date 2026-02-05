import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import unraidProxyHandler from "./proxy";

describe("widgets/unraid/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the Unraid GraphQL endpoint and returns a flattened response", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://unraid", key: "k" });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(
        JSON.stringify({
          data: {
            metrics: { memory: { active: 10, available: 90, percentTotal: 10 }, cpu: { percentTotal: 5 } },
            notifications: { overview: { unread: { total: 2 } } },
            array: {
              state: "STARTED",
              capacity: { kilobytes: { free: 10, used: 20, total: 40 } },
              caches: [{ name: "cache", fsType: "btrfs", fsSize: 100, fsFree: 25, fsUsed: 75 }],
            },
          },
        }),
      ),
    ]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await unraidProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://unraid/graphql");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        memoryUsedPercent: 10,
        cpuPercent: 5,
        unreadNotifications: 2,
        arrayState: "STARTED",
      }),
    );
    expect(res.body.caches.cache.fsUsedPercent).toBe(75);
  });

  it("returns 500 when the response cannot be processed", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://unraid", key: "k" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("not-json")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await unraidProxyHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });
});
