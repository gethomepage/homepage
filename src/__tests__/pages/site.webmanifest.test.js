import { describe, expect, it, vi } from "vitest";

import themes from "utils/styles/themes";

const { checkAndCopyConfig, getSettings } = vi.hoisted(() => ({
  checkAndCopyConfig: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
  getSettings,
}));

import Webmanifest, { getServerSideProps } from "pages/site.webmanifest.jsx";

function createMockRes() {
  return {
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
}

describe("pages/site.webmanifest", () => {
  it("writes a manifest json response and triggers a settings config check", async () => {
    getSettings.mockReturnValueOnce({
      title: "My Homepage",
      startUrl: "/start",
      color: "slate",
      theme: "dark",
      pwa: {
        icons: [{ src: "/i.png", sizes: "1x1", type: "image/png" }],
        shortcuts: [{ name: "One", url: "/one" }],
      },
    });

    const res = createMockRes();

    await getServerSideProps({ res });

    expect(checkAndCopyConfig).toHaveBeenCalledWith("settings.yaml");
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/manifest+json");
    expect(res.end).toHaveBeenCalled();

    const manifest = JSON.parse(res.write.mock.calls[0][0]);
    expect(manifest.name).toBe("My Homepage");
    expect(manifest.short_name).toBe("My Homepage");
    expect(manifest.start_url).toBe("/start");
    expect(manifest.icons).toEqual([{ src: "/i.png", sizes: "1x1", type: "image/png" }]);
    expect(manifest.shortcuts).toEqual([{ name: "One", url: "/one" }]);
    expect(manifest.theme_color).toBe(themes.slate.dark);
    expect(manifest.background_color).toBe(themes.slate.dark);
  });

  it("uses sensible defaults when no settings are provided", async () => {
    getSettings.mockReturnValueOnce({});

    const res = createMockRes();

    await getServerSideProps({ res });

    const manifest = JSON.parse(res.write.mock.calls[0][0]);
    expect(manifest.name).toBe("Homepage");
    expect(manifest.short_name).toBe("Homepage");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe(themes.slate.dark);
    expect(manifest.background_color).toBe(themes.slate.dark);

    // Default icon set is used when pwa.icons is not set.
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: expect.stringContaining("android-chrome-192x192") }),
        expect.objectContaining({ src: expect.stringContaining("android-chrome-512x512") }),
      ]),
    );
  });

  it("respects provided pwa.icons even when it is an empty array", async () => {
    getSettings.mockReturnValueOnce({
      pwa: { icons: [] },
    });

    const res = createMockRes();

    await getServerSideProps({ res });

    const manifest = JSON.parse(res.write.mock.calls[0][0]);
    expect(manifest.icons).toEqual([]);
  });

  it("exports a placeholder component", () => {
    expect(Webmanifest()).toBeNull();
  });
});
