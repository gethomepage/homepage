import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { widgetsResponse } = vi.hoisted(() => ({
  widgetsResponse: vi.fn(),
}));

vi.mock("utils/config/api-response", () => ({
  widgetsResponse,
}));

import handler from "pages/api/widgets/index";

describe("pages/api/widgets/index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns widgetsResponse()", async () => {
    widgetsResponse.mockResolvedValueOnce([{ type: "logo", options: {} }]);

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual([{ type: "logo", options: {} }]);
  });
});
