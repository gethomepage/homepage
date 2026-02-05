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
    suwayomi: {
      api: "{url}/graphql",
    },
  },
}));

import suwayomiProxyHandler from "./proxy";

describe("widgets/suwayomi/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns extracted counts from GraphQL response (no category)", async () => {
    getServiceWidget.mockResolvedValue({ type: "suwayomi", url: "http://su", fields: ["download", "unread"] });

    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ data: { download: { totalCount: 2 }, unread: { totalCount: 5 } } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { count: 2, label: "suwayomi.download" },
      { count: 5, label: "suwayomi.unread" },
    ]);
  });

  it("returns 401 when credentials are invalid", async () => {
    getServiceWidget.mockResolvedValue({ type: "suwayomi", url: "http://su", username: "u", password: "p" });
    httpProxy.mockResolvedValueOnce([401, "application/json", Buffer.from("{}")]);

    const req = { query: { group: "g", service: "svc", endpoint: "graphql", index: "0" } };
    const res = createMockRes();

    await suwayomiProxyHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toContain("unauthorized");
  });
});
