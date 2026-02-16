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
    audiobookshelf: {
      api: "{url}/api/{endpoint}",
    },
  },
}));

import audiobookshelfProxyHandler from "./proxy";

describe("widgets/audiobookshelf/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves libraries and per-library stats", async () => {
    getServiceWidget.mockResolvedValue({ type: "audiobookshelf", url: "http://abs", key: "k" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            libraries: [
              { id: "l1", name: "A" },
              { id: "l2", name: "B" },
            ],
          }),
        ),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ total: 1 }))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ total: 2 }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "libraries", index: "0" } };
    const res = createMockRes();

    await audiobookshelfProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer k");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { id: "l1", name: "A", stats: { total: 1 } },
      { id: "l2", name: "B", stats: { total: 2 } },
    ]);
  });
});
