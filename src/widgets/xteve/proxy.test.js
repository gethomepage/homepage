import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
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

vi.mock("widgets/widgets", () => ({
  default: {
    xteve: {
      api: "{url}/{endpoint}",
    },
  },
}));

import xteveProxyHandler from "./proxy";

describe("widgets/xteve/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in when credentials are provided and includes token in subsequent status request", async () => {
    getServiceWidget.mockResolvedValue({
      type: "xteve",
      url: "http://xteve",
      username: "u",
      password: "p",
    });

    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ status: true, token: "tok" }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from("status-data")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await xteveProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(2);
    expect(httpProxy.mock.calls[0][0]).toBe("http://xteve/api/");
    expect(JSON.parse(httpProxy.mock.calls[0][1].body)).toEqual({
      cmd: "login",
      username: "u",
      password: "p",
    });
    expect(JSON.parse(httpProxy.mock.calls[1][1].body)).toEqual({ cmd: "status", token: "tok" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("status-data"));
  });

  it("returns 401 when authentication fails", async () => {
    getServiceWidget.mockResolvedValue({
      type: "xteve",
      url: "http://xteve",
      username: "u",
      password: "p",
    });

    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ status: false }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await xteveProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("Authentication failed");
  });

  it("skips login when credentials are not provided", async () => {
    getServiceWidget.mockResolvedValue({ type: "xteve", url: "http://xteve" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("status-data")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await xteveProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(httpProxy.mock.calls[0][1].body)).toEqual({ cmd: "status" });
    expect(res.statusCode).toBe(200);
  });
});
