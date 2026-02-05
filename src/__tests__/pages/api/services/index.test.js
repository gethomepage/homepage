import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { servicesResponse } = vi.hoisted(() => ({
  servicesResponse: vi.fn(),
}));

vi.mock("utils/config/api-response", () => ({
  servicesResponse,
}));

import handler from "pages/api/services/index";

describe("pages/api/services/index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns servicesResponse()", async () => {
    servicesResponse.mockResolvedValueOnce({ services: [] });

    const req = {};
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ services: [] });
  });
});
