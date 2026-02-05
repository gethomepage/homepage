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

import photoprismProxyHandler from "./proxy";

describe("widgets/photoprism/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("supports bearer-token auth and returns config count", async () => {
    getServiceWidget.mockResolvedValue({ url: "http://pp", key: "k" });
    httpProxy.mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ config: { count: 123 } }))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await photoprismProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer k");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(123);
  });
});
