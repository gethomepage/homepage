import { describe, expect, it } from "vitest";

import themes from "./themes";

describe("utils/styles/themes", () => {
  it("contains expected theme palettes", () => {
    expect(themes).toHaveProperty("slate");
    expect(themes.slate).toEqual(
      expect.objectContaining({
        light: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        dark: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        iconStart: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        iconEnd: expect.stringMatching(/^#[0-9a-f]{6}$/i),
      }),
    );
  });
});
