import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getSettings, servicesResponse, bookmarksResponse, widgetsResponse, serverSideTranslations, logger } =
  vi.hoisted(() => {
    const state = {
      throwIn: null,
    };

    const getSettings = vi.fn(() => ({
      providers: {},
      language: "en",
      title: "Homepage",
    }));

    const servicesResponse = vi.fn(async () => {
      if (state.throwIn === "services") throw new Error("services failed");
      return [{ name: "svc" }];
    });
    const bookmarksResponse = vi.fn(async () => {
      if (state.throwIn === "bookmarks") throw new Error("bookmarks failed");
      return [{ name: "bm" }];
    });
    const widgetsResponse = vi.fn(async () => {
      if (state.throwIn === "widgets") throw new Error("widgets failed");
      return [{ type: "search" }];
    });

    const serverSideTranslations = vi.fn(async (language) => ({ _translations: language }));
    const logger = { error: vi.fn() };

    return { state, getSettings, servicesResponse, bookmarksResponse, widgetsResponse, serverSideTranslations, logger };
  });

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));
vi.mock("next/head", () => ({ default: ({ children }) => children }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/router", () => ({ useRouter: () => ({ asPath: "/" }) }));

vi.mock("next-i18next/serverSideTranslations", () => ({
  serverSideTranslations,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

vi.mock("utils/config/api-response", () => ({
  servicesResponse,
  bookmarksResponse,
  widgetsResponse,
}));

describe("pages/index getStaticProps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.throwIn = null;
  });

  it("returns initial settings and api fallbacks for swr", async () => {
    getSettings.mockReturnValueOnce({ providers: { x: 1 }, language: "en", title: "Homepage" });

    const { getStaticProps } = await import("./index.jsx");
    const result = await getStaticProps();

    expect(result.props.initialSettings).toEqual({ language: "en", title: "Homepage" });
    expect(result.props.fallback["/api/services"]).toEqual([{ name: "svc" }]);
    expect(result.props.fallback["/api/bookmarks"]).toEqual([{ name: "bm" }]);
    expect(result.props.fallback["/api/widgets"]).toEqual([{ type: "search" }]);
    expect(result.props.fallback["/api/hash"]).toBe(false);
    expect(serverSideTranslations).toHaveBeenCalledWith("en");
  });

  it("normalizes legacy language codes before requesting translations", async () => {
    getSettings.mockReturnValueOnce({ providers: {}, language: "zh-CN" });

    const { getStaticProps } = await import("./index.jsx");
    await getStaticProps();

    expect(serverSideTranslations).toHaveBeenCalledWith("zh-Hans");
  });

  it("falls back to empty settings and en translations on errors", async () => {
    getSettings.mockReturnValueOnce({ providers: {}, language: "de" });
    state.throwIn = "services";

    const { getStaticProps } = await import("./index.jsx");
    const result = await getStaticProps();

    expect(result.props.initialSettings).toEqual({});
    expect(result.props.fallback["/api/services"]).toEqual([]);
    expect(result.props.fallback["/api/bookmarks"]).toEqual([]);
    expect(result.props.fallback["/api/widgets"]).toEqual([]);
    expect(serverSideTranslations).toHaveBeenCalledWith("en");
    expect(logger.error).toHaveBeenCalled();
  });
});
