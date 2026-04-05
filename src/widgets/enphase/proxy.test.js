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
vi.mock("widgets/widgets", () => ({
  default: {
    enphase: {
      api: "{url}/production.json",
    },
  },
}));

import enphaseProxyHandler from "./proxy";

const makeReq = () => ({ query: { group: "g", service: "svc", index: "0" } });

const makeProductionJson = ({ hasConsumption = true, netWhToday = 0 } = {}) => ({
  production: [
    { type: "inverters", wNow: 100, whToday: 800 },
    { type: "eim", wNow: 2400, whToday: 14500 },
  ],
  consumption: hasConsumption
    ? [
      { measurementType: "total-consumption", wNow: 1800, whToday: 12000 },
      { measurementType: "net-consumption", wNow: -600, whToday: netWhToday },
    ]
    : undefined,
});

describe("widgets/enphase/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns shaped data from EIM production and consumption meters", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([200, "application/json", Buffer.from(JSON.stringify(makeProductionJson()))]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      wNow: 2400,
      whToday: 14500,
      consumptionWhToday: 12000,
      importedToday: 0, // net-consumption whToday (grid import)
      exportedToday: 2500, // 14500 produced - 12000 consumed
    });
  });

  it("shows exported when production exceeds consumption", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    const json = makeProductionJson();
    // 82560 Wh produced, 42430 Wh consumed => ~40130 Wh exported
    json.production[1].whToday = 82560;
    json.consumption[0].whToday = 42430;
    json.consumption[1].whToday = 0;
    httpProxy.mockResolvedValue([200, "application/json", Buffer.from(JSON.stringify(json))]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.body.exportedToday).toBe(40130);
    expect(res.body.importedToday).toBe(0);
  });

  it("falls back to inverters when no EIM meter is present", async () => {
    const json = makeProductionJson();
    json.production = json.production.filter((p) => p.type !== "eim");

    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([200, "application/json", Buffer.from(JSON.stringify(json))]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.wNow).toBe(100);
    expect(res.body.whToday).toBe(800);
  });

  it("returns null for consumption fields when no consumption meters are present", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([
      200,
      "application/json",
      Buffer.from(JSON.stringify(makeProductionJson({ hasConsumption: false }))),
    ]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.consumptionWhToday).toBeNull();
    expect(res.body.importedToday).toBeNull();
    expect(res.body.exportedToday).toBeNull();
  });

  it("sends Bearer token header when widget.token is set", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242", token: "mytoken" });
    httpProxy.mockResolvedValue([200, "application/json", Buffer.from(JSON.stringify(makeProductionJson()))]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer mytoken");
  });

  it("sends no Authorization header when widget.token is absent", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([200, "application/json", Buffer.from(JSON.stringify(makeProductionJson()))]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("returns an error object on non-200 response", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([401, "application/json", Buffer.from("Unauthorized")]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("HTTP Error");
    expect(res.body.error.data).toBe("Unauthorized");
  });

  it("does not expose the token in error URLs", async () => {
    getServiceWidget.mockResolvedValue({
      type: "enphase",
      url: "https://10.9.8.242",
      token: "supersecret",
    });
    httpProxy.mockResolvedValue([500, "application/json", Buffer.from("error")]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.body.error.url).not.toContain("supersecret");
  });

  it("passes through non-Buffer error data as-is", async () => {
    getServiceWidget.mockResolvedValue({ type: "enphase", url: "https://10.9.8.242" });
    httpProxy.mockResolvedValue([503, "application/json", { message: "unavailable" }]);

    const res = createMockRes();
    await enphaseProxyHandler(makeReq(), res);

    expect(res.statusCode).toBe(503);
    expect(res.body.error.data).toEqual({ message: "unavailable" });
  });
});
