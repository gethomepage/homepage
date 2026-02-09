import { describe, expect, it } from "vitest";

import { getHomepageCapabilities } from "./capabilities";

describe("utils/config/capabilities", () => {
  it("returns service widget capabilities parsed from docs", () => {
    const capabilities = getHomepageCapabilities();

    expect(capabilities.serviceWidgets.length).toBeGreaterThan(10);
    expect(capabilities.serviceWidgets.some((item) => item.type === "radarr")).toBe(true);
  });

  it("returns info widget capabilities parsed from docs", () => {
    const capabilities = getHomepageCapabilities();

    expect(capabilities.infoWidgets.length).toBeGreaterThan(3);
    expect(capabilities.infoWidgets.some((item) => item.type === "search")).toBe(true);
    expect(capabilities.infoWidgets.some((item) => item.type === "resources")).toBe(true);
  });
});
