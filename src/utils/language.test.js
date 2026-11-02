import { describe, expect, it } from "vitest";

import normalizeLanguage from "utils/language";

describe("utils/language", () => {
  it("defaults to en and maps legacy aliases", () => {
    expect(normalizeLanguage(undefined)).toBe("en");
    expect(normalizeLanguage("zh-CN")).toBe("zh-Hans");
    expect(normalizeLanguage("de")).toBe("de");
  });
});
