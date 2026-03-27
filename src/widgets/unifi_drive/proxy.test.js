import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cache, logger } = vi.hoisted(() => {
  const store = new Map();
  return {
    httpProxy: vi.fn(),
    getServiceWidget: vi.fn(),
    cache: {
      get: vi.fn((k) => (store.has(k) ? store.get(k) : null)),
      put: vi.fn((k, v) => store.set(k, v)),
      del: vi.fn((k) => store.delete(k)),
      _reset: () => store.clear(),
    },
    logger: { debug: vi.fn(), error: vi.fn() },
  };
});

vi.mock("memory-cache", () => ({ default: cache, ...cache }));
vi.mock("utils/logger", () => ({ default: () => logger }));
vi.mock("utils/config/service-helpers", () => ({ default: getServiceWidget }));
vi.mock("utils/proxy/http", () => ({ httpProxy }));
vi.mock("widgets/widgets", () => ({
  default: { unifi_drive: { api: "{url}{prefix}/api/{endpoint}" } },
}));

import unifiDriveProxyHandler from "./proxy";

const widgetConfig = { type: "unifi_drive", url: "http://unifi", username: "u", password: "p" };

describe("widgets/unifi_drive/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache._reset();
  });

  it("returns 400 when widget config is missing", async () => {
    getServiceWidget.mockResolvedValue(null);
    const res = createMockRes();
    await unifiDriveProxyHandler(
      { query: { group: "g", service: "s", endpoint: "v1/systems/storage?type=detail" } },
      res,
    );
    expect(res.statusCode).toBe(400);
  });

  it("returns 403 when widget type has no API config", async () => {
    getServiceWidget.mockResolvedValue({ ...widgetConfig, type: "unknown" });
    const res = createMockRes();
    await unifiDriveProxyHandler({ query: { group: "g", service: "s", endpoint: "storage" } }, res);
    expect(res.statusCode).toBe(403);
  });

  it("uses /proxy/drive prefix and returns data on success", async () => {
    getServiceWidget.mockResolvedValue({ ...widgetConfig });
    httpProxy
      .mockResolvedValueOnce([200, "text/html", Buffer.from(""), {}])
      .mockResolvedValueOnce([200, "application/json", Buffer.from('{"data":{}}'), {}]);

    const res = createMockRes();
    await unifiDriveProxyHandler({ query: { group: "g", service: "s", endpoint: "storage" } }, res);

    expect(httpProxy.mock.calls[0][0]).toBe("http://unifi");
    expect(httpProxy.mock.calls[1][0].toString()).toContain("/proxy/drive/api/");
    expect(cache.put).toHaveBeenCalledWith("unifiDriveProxyHandler__prefix.s", "/proxy/drive");
    expect(res.statusCode).toBe(200);
  });

  it("skips prefix detection when cached", async () => {
    getServiceWidget.mockResolvedValue({ ...widgetConfig });
    cache.put("unifiDriveProxyHandler__prefix.s", "/proxy/drive");
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from('{"data":{}}'), {}]);

    const res = createMockRes();
    await unifiDriveProxyHandler({ query: { group: "g", service: "s", endpoint: "storage" } }, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toContain("/proxy/drive/api/");
    expect(res.statusCode).toBe(200);
  });
});
