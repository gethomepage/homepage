import { describe, expect, it, vi } from "vitest";

import themes from "utils/styles/themes";

const { getSettings } = vi.hoisted(() => ({
  getSettings: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

import BrowserConfig, { getServerSideProps } from "pages/browserconfig.xml.jsx";

function createMockRes() {
  return {
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
}

describe("pages/browserconfig.xml", () => {
  it("writes a browserconfig xml response using the selected theme color", async () => {
    getSettings.mockReturnValueOnce({ color: "slate", theme: "dark" });
    const res = createMockRes();

    await getServerSideProps({ res });

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/xml");
    expect(res.end).toHaveBeenCalled();

    const xml = res.write.mock.calls[0][0];
    expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).toContain('<square150x150logo src="/mstile-150x150.png?v=2"/>');
    expect(xml).toContain(`<TileColor>${themes.slate.dark}</TileColor>`);
  });

  it("exports a placeholder component", () => {
    expect(BrowserConfig()).toBeUndefined();
  });
});
