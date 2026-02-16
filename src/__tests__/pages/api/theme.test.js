import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { checkAndCopyConfig, getSettings } = vi.hoisted(() => ({
  checkAndCopyConfig: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
  getSettings,
}));

import handler from "pages/api/theme";

describe("pages/api/theme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when settings are missing", () => {
    getSettings.mockReturnValueOnce({});

    const res = createMockRes();
    handler({ res });

    expect(checkAndCopyConfig).toHaveBeenCalledWith("settings.yaml");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ color: "slate", theme: "dark" });
  });

  it("returns configured color + theme when present", () => {
    getSettings.mockReturnValueOnce({ color: "red", theme: "light" });

    const res = createMockRes();
    handler({ res });

    expect(res.body).toEqual({ color: "red", theme: "light" });
  });
});
