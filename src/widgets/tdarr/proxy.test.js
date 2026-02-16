import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: { debug: vi.fn(), error: vi.fn() },
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
    tdarr: {
      api: "{url}/api",
    },
  },
}));

import tdarrProxyHandler from "./proxy";

describe("widgets/tdarr/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POSTs the stats request and includes the API key header", async () => {
    getServiceWidget.mockResolvedValue({ type: "tdarr", url: "http://td", key: "k" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from("ok")]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await tdarrProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("http://td/api");
    expect(httpProxy.mock.calls[0][1].headers["x-api-key"]).toBe("k");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(Buffer.from("ok"));
  });
});
