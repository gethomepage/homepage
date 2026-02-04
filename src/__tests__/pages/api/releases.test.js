import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { cachedRequest, logger } = vi.hoisted(() => ({
  cachedRequest: vi.fn(),
  logger: { error: vi.fn() },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/proxy/http", () => ({
  cachedRequest,
}));

import handler from "pages/api/releases";

describe("pages/api/releases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached GitHub releases", async () => {
    cachedRequest.mockResolvedValueOnce([{ tag_name: "v1" }]);

    const req = {};
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual([{ tag_name: "v1" }]);
  });

  it("returns [] when cachedRequest throws", async () => {
    cachedRequest.mockRejectedValueOnce(new Error("nope"));

    const req = {};
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual([]);
  });
});
