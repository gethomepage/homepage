import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { getPrivateWidgetOptions, httpProxy, logger } = vi.hoisted(() => ({
  getPrivateWidgetOptions: vi.fn(),
  httpProxy: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("utils/config/widget-helpers", () => ({
  getPrivateWidgetOptions,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import handler from "pages/api/widgets/glances";

describe("pages/api/widgets/glances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when the widget URL is missing", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({});

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing Glances URL");
  });

  it("returns cpu/load/mem and includes optional endpoints when requested", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://glances", username: "u", password: "p" });

    httpProxy
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ total: 1 }))]) // cpu
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ avg: 2 }))]) // load
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ available: 3 }))]) // mem
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify("1 days"))]) // uptime
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify([{ label: "cpu_thermal", value: 50 }]))]) // sensors
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify([{ mnt_point: "/", percent: 1 }]))]); // fs

    const req = { query: { index: "0", uptime: "1", cputemp: "1", disk: "1", version: "4" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledWith(
      "http://glances/api/4/cpu",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      cpu: { total: 1 },
      load: { avg: 2 },
      mem: { available: 3 },
      uptime: "1 days",
      sensors: [{ label: "cpu_thermal", value: 50 }],
      fs: [{ mnt_point: "/", percent: 1 }],
    });
  });

  it("does not call optional endpoints unless requested", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://glances" });

    httpProxy
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ total: 1 }))]) // cpu
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ avg: 2 }))]) // load
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ available: 3 }))]); // mem

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(res.statusCode).toBe(200);
  });

  it("returns 400 when glances returns 401", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://glances" });
    httpProxy.mockResolvedValueOnce([401, null, Buffer.from("nope")]);

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.stringContaining("Authorization failure") }));
  });

  it("returns 400 when glances returns a non-200 status for a downstream call", async () => {
    getPrivateWidgetOptions.mockResolvedValueOnce({ url: "http://glances" });

    httpProxy
      .mockResolvedValueOnce([200, null, Buffer.from(JSON.stringify({ total: 1 }))]) // cpu
      .mockResolvedValueOnce([500, null, Buffer.from("nope")]); // load

    const req = { query: { index: "0" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.stringContaining("HTTP 500") }));
  });
});
