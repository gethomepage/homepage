import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, cookieJar, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  cookieJar: {
    addCookieToJar: vi.fn(),
  },
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
vi.mock("utils/proxy/cookie-jar", () => cookieJar);
vi.mock("widgets/widgets", () => ({
  default: {
    frigate: {
      api: "{url}/api/{endpoint}",
    },
  },
}));

import frigateProxyHandler from "./proxy";

describe("widgets/frigate/proxy", () => {
  beforeEach(() => {
    httpProxy.mockReset();
    getServiceWidget.mockReset();
    vi.clearAllMocks();
  });

  it("returns 400 when group/service are missing", async () => {
    const req = { query: { service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
    expect(getServiceWidget).not.toHaveBeenCalled();
  });

  it("returns 400 when the widget cannot be resolved", async () => {
    getServiceWidget.mockResolvedValue(null);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid proxy service type" });
  });

  it("returns 403 when the service does not support API calls", async () => {
    getServiceWidget.mockResolvedValue({
      type: "not-frigate",
      url: "http://frigate",
    });

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Service does not support API calls" });
    expect(httpProxy).not.toHaveBeenCalled();
  });

  it("returns an HTTP error when the request fails without login credentials", async () => {
    getServiceWidget.mockResolvedValue({
      type: "frigate",
      url: "http://frigate",
    });

    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("nope")]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "HTTP Error 401 from Frigate",
          url: "http://frigate/api/stats",
        }),
      }),
    );
  });

  it("logs in after a 401 and returns derived stats", async () => {
    getServiceWidget.mockResolvedValue({
      type: "frigate",
      url: "http://frigate",
      username: "u",
      password: "p",
    });

    httpProxy
      // initial request
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      // login
      .mockResolvedValueOnce([200, "application/json", Buffer.from("{}"), { "set-cookie": ["sid=1"] }])
      // retry stats
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(JSON.stringify({ cameras: { a: {}, b: {} }, service: { uptime: 123, version: "1.0" } })),
      ]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(cookieJar.addCookieToJar).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ num_cameras: 2, uptime: 123, version: "1.0" });
  });

  it("returns an error when login fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "frigate",
      url: "http://frigate",
      username: "u",
      password: "p",
    });

    httpProxy
      // initial request unauthorized
      .mockResolvedValueOnce([401, "application/json", Buffer.from("nope")])
      // login fails
      .mockResolvedValueOnce([500, "application/json", Buffer.from("nope"), {}]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "HTTP Error 401 while trying to login to Frigate",
          url: "http://frigate/api/stats",
        }),
      }),
    );
    expect(cookieJar.addCookieToJar).not.toHaveBeenCalled();
    expect(httpProxy).toHaveBeenCalledTimes(2);
  });

  it("maps events to a simplified payload with dates", async () => {
    getServiceWidget.mockResolvedValue({
      type: "frigate",
      url: "http://frigate",
    });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(
        JSON.stringify([
          {
            id: "1",
            camera: "front",
            label: "person",
            start_time: 1700000000,
            thumbnail: "t1",
            data: { score: 0.5, type: "object" },
          },
          {
            id: "2",
            camera: "back",
            label: "car",
            start_time: 1700000100,
            thumbnail: "t2",
            data: { score: 0.8, type: "object" },
          },
          {
            id: "3",
            camera: "side",
            label: "dog",
            start_time: 1700000200,
            thumbnail: "t3",
            data: { score: 0.9, type: "object" },
          },
          {
            id: "4",
            camera: "garage",
            label: "cat",
            start_time: 1700000300,
            thumbnail: "t4",
            data: { score: 0.1, type: "object" },
          },
          {
            id: "5",
            camera: "drive",
            label: "person",
            start_time: 1700000400,
            thumbnail: "t5",
            data: { score: 0.2, type: "object" },
          },
          {
            id: "6",
            camera: "extra",
            label: "person",
            start_time: 1700000500,
            thumbnail: "t6",
            data: { score: 0.3, type: "object" },
          },
        ]),
      ),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "events", index: "0" } };
    const res = createMockRes();

    await frigateProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        id: "1",
        camera: "front",
        label: "person",
        thumbnail: "t1",
        score: 0.5,
        type: "object",
        start_time: expect.any(Date),
      }),
    );
  });
});
