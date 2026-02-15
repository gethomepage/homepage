import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
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

vi.mock("widgets/widgets", () => ({
  default: {
    komga: {
      api: "{url}/{endpoint}",
      mappings: {
        series: { endpoint: "series" },
        books: { endpoint: "books" },
        seriesv2: { endpoint: "series/v2" },
        booksv2: { endpoint: "books/v2" },
      },
    },
  },
}));

import komgaProxyHandler from "./proxy";

describe("widgets/komga/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches libraries, series, and books and returns aggregated data", async () => {
    getServiceWidget.mockResolvedValue({ type: "komga", url: "http://kg", key: "k" });

    httpProxy
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify([
            { id: 1, unavailable: false },
            { id: 2, unavailable: true },
          ]),
        ),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([{ id: "s1" }]))])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify([{ id: "b1" }]))]);

    const req = { query: { group: "g", service: "svc", index: "0" } };
    const res = createMockRes();

    await komgaProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][1].headers["X-API-Key"]).toBe("k");
    expect(res.body).toEqual({
      libraries: [{ id: 1, unavailable: false }],
      series: [{ id: "s1" }],
      books: [{ id: "b1" }],
    });
  });
});
