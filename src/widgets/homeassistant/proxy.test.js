import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn() },
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

import homeassistantProxyHandler from "./proxy";

describe("widgets/homeassistant/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when custom JSON cannot be parsed", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://hass", key: "k", custom: "{not-json" });

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await homeassistantProxyHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Error parsing widget custom label" });
  });

  it("runs default template queries and returns label/value pairs", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://hass", key: "k" });
    httpProxy
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("1 / 2")])
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("3 / 4")])
      .mockResolvedValueOnce([200, "text/plain", Buffer.from("5 / 6")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await homeassistantProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { label: "homeassistant.people_home", value: "1 / 2" },
      { label: "homeassistant.lights_on", value: "3 / 4" },
      { label: "homeassistant.switches_on", value: "5 / 6" },
    ]);
  });
});
