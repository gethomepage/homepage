import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { checkAndCopyConfig } = vi.hoisted(() => ({
  checkAndCopyConfig: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
}));

import handler from "pages/api/validate";

describe("pages/api/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns errors for any configs that don't validate", async () => {
    checkAndCopyConfig.mockReturnValueOnce(true).mockReturnValueOnce("settings bad").mockReturnValue(true);

    const req = {};
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual(["settings bad"]);
  });
});
