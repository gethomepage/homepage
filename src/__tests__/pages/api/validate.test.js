import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { checkAndCopyConfig, getSettings } = vi.hoisted(() => ({
  checkAndCopyConfig: vi.fn(),
  getSettings: vi.fn(() => ({})),
}));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
  getSettings,
  CONF_DIR: "/tmp",
}));

import handler from "pages/api/validate";

describe("pages/api/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns errors for any configs that don't validate", async () => {
    checkAndCopyConfig
      .mockReturnValueOnce(true)
      .mockReturnValueOnce({
        name: "YAMLException",
        config: "settings.yaml",
        reason: "settings bad",
        mark: { line: 1 },
      })
      .mockReturnValue(true);

    const req = {};
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual([
      {
        name: "YAMLException",
        config: "settings.yaml",
        reason: "settings bad",
        mark: { line: 1 },
      },
    ]);
  });
});
