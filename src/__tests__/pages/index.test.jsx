// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ColorContext } from "utils/contexts/color";
import { SettingsContext } from "utils/contexts/settings";
import { TabContext } from "utils/contexts/tab";
import { ThemeContext } from "utils/contexts/theme";

const {
  state,
  router,
  i18n,
  getSettings,
  servicesResponse,
  bookmarksResponse,
  widgetsResponse,
  serverSideTranslations,
  logger,
  useSWR,
  useWindowFocus,
} = vi.hoisted(() => {
  const state = {
    throwIn: null,
    validateData: [],
    hashData: null,
    mutateHash: vi.fn(),
    servicesData: [],
    bookmarksData: [],
    widgetsData: [],
    quickLaunchProps: null,
    widgetCalls: [],
    windowFocused: false,
  };

  const router = { asPath: "/" };
  const i18n = { language: "en", changeLanguage: vi.fn() };

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

  const useSWR = vi.fn((key) => {
    if (key === "/api/validate") return { data: state.validateData };
    if (key === "/api/hash") return { data: state.hashData, mutate: state.mutateHash };
    if (key === "/api/services") return { data: state.servicesData };
    if (key === "/api/bookmarks") return { data: state.bookmarksData };
    if (key === "/api/widgets") return { data: state.widgetsData };
    return { data: undefined };
  });

  const useWindowFocus = vi.fn(() => state.windowFocused);

  return {
    state,
    router,
    i18n,
    getSettings,
    servicesResponse,
    bookmarksResponse,
    widgetsResponse,
    serverSideTranslations,
    logger,
    useSWR,
    useWindowFocus,
  };
});

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));
vi.mock("next/head", () => ({ default: ({ children }) => children }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/router", () => ({ useRouter: () => router }));

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    i18n,
    t: (k) => k,
  }),
}));

vi.mock("next-i18next/serverSideTranslations", () => ({
  serverSideTranslations,
}));

vi.mock("swr", () => ({
  default: useSWR,
  SWRConfig: ({ children }) => children,
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

vi.mock("utils/hooks/window-focus", () => ({
  default: useWindowFocus,
}));

vi.mock("components/bookmarks/group", () => ({
  default: ({ bookmarks }) => <div data-testid="bookmarks-group">{bookmarks?.name}</div>,
}));

vi.mock("components/services/group", () => ({
  default: ({ group }) => <div data-testid="services-group">{group?.name}</div>,
}));

vi.mock("components/errorboundry", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("components/tab", () => ({
  default: ({ tab }) => <li data-testid="tab">{tab}</li>,
  slugifyAndEncode: (tabName) =>
    tabName !== undefined ? encodeURIComponent(tabName.toString().replace(/\\s+/g, "-").toLowerCase()) : "",
}));

vi.mock("components/quicklaunch", () => ({
  default: (props) => {
    state.quickLaunchProps = props;
    return (
      <div data-testid="quicklaunch">
        {props.isOpen ? "open" : "closed"}:{props.servicesAndBookmarks?.length ?? 0}
      </div>
    );
  },
}));

vi.mock("components/widgets/widget", () => ({
  default: ({ widget, style }) => {
    state.widgetCalls.push({ widget, style });
    return <div data-testid="widget">{widget?.type}</div>;
  },
}));

vi.mock("components/toggles/revalidate", () => ({
  default: () => null,
}));

describe("pages/index getStaticProps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.throwIn = null;
    state.validateData = [];
    state.hashData = null;
    state.servicesData = [];
    state.bookmarksData = [];
    state.widgetsData = [];
    state.quickLaunchProps = null;
    state.widgetCalls = [];
    state.windowFocused = false;
    router.asPath = "/";
    i18n.changeLanguage.mockClear();
  });

  it("returns initial settings and api fallbacks for swr", async () => {
    getSettings.mockReturnValueOnce({ providers: { x: 1 }, language: "en", title: "Homepage" });

    const { getStaticProps } = await import("pages/index.jsx");
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

    const { getStaticProps } = await import("pages/index.jsx");
    await getStaticProps();

    expect(serverSideTranslations).toHaveBeenCalledWith("zh-Hans");
  });

  it("falls back to empty settings and en translations on errors", async () => {
    getSettings.mockReturnValueOnce({ providers: {}, language: "de" });
    state.throwIn = "services";

    const { getStaticProps } = await import("pages/index.jsx");
    const result = await getStaticProps();

    expect(result.props.initialSettings).toEqual({});
    expect(result.props.fallback["/api/services"]).toEqual([]);
    expect(result.props.fallback["/api/bookmarks"]).toEqual([]);
    expect(result.props.fallback["/api/widgets"]).toEqual([]);
    expect(serverSideTranslations).toHaveBeenCalledWith("en");
    expect(logger.error).toHaveBeenCalled();
  });
});

async function renderIndex({
  initialSettings = { title: "Homepage", layout: {} },
  fallback = {},
  theme = "dark",
  color = "slate",
  activeTab = "",
  settings = initialSettings,
} = {}) {
  const { default: Wrapper } = await import("pages/index.jsx");

  const setTheme = vi.fn();
  const setColor = vi.fn();
  const setSettings = vi.fn();
  const setActiveTab = vi.fn();

  const renderResult = render(
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ColorContext.Provider value={{ color, setColor }}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          <TabContext.Provider value={{ activeTab, setActiveTab }}>
            <Wrapper initialSettings={initialSettings} fallback={fallback} />
          </TabContext.Provider>
        </SettingsContext.Provider>
      </ColorContext.Provider>
    </ThemeContext.Provider>,
  );

  return { ...renderResult, setTheme, setColor, setSettings, setActiveTab };
}

describe("pages/index Wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.validateData = [];
    state.hashData = null;
    state.servicesData = [];
    state.bookmarksData = [];
    state.widgetsData = [];
    state.widgetCalls = [];
    document.documentElement.className = "dark theme-slate";
  });

  it("applies theme/color classes and renders a background overlay when configured", async () => {
    await renderIndex({
      initialSettings: {
        title: "Homepage",
        color: "slate",
        background: { image: "https://example.com/bg.jpg", opacity: 10, blur: true, saturate: 150, brightness: 125 },
        layout: {},
      },
      theme: "dark",
      color: "emerald",
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains("scheme-dark")).toBe(true);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-emerald")).toBe(true);
    expect(document.documentElement.classList.contains("theme-slate")).toBe(false);

    expect(document.querySelector("#background")).toBeTruthy();
    expect(document.querySelector("#inner_wrapper")?.className).toContain("backdrop-blur");
    expect(document.querySelector("#inner_wrapper")?.className).toContain("backdrop-saturate-150");
    expect(document.querySelector("#inner_wrapper")?.className).toContain("backdrop-brightness-125");
  });

  it("supports legacy string backgrounds in settings", async () => {
    await renderIndex({
      initialSettings: {
        title: "Homepage",
        color: "slate",
        background: "https://example.com/bg.jpg",
        layout: {},
      },
      theme: "dark",
      color: "emerald",
    });

    expect(document.querySelector("#background")).toBeTruthy();
  });
});

describe("pages/index Index routing + SWR branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.hashData = null;
    state.mutateHash.mockClear();
    state.servicesData = [];
    state.bookmarksData = [];
    state.widgetsData = [];
  });

  it("renders the validation error screen when /api/validate returns an error", async () => {
    state.validateData = { error: "bad config" };

    await renderIndex({ initialSettings: { title: "Homepage", layout: {} }, settings: { layout: {} } });

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("bad config")).toBeInTheDocument();
  });

  it("renders config errors when /api/validate returns a list of errors", async () => {
    state.validateData = [{ config: "services.yaml", reason: "broken", mark: { snippet: "x: y" } }];

    await renderIndex({ initialSettings: { title: "Homepage", layout: {} }, settings: { layout: {} } });

    expect(screen.getByText("services.yaml")).toBeInTheDocument();
    expect(screen.getByText("broken")).toBeInTheDocument();
    expect(screen.getByText("x: y")).toBeInTheDocument();
  });

  it("marks the UI stale when the hash changes and triggers a revalidate reload", async () => {
    state.validateData = [];
    state.hashData = { hash: "new-hash" };
    localStorage.setItem("hash", "old-hash");

    const fetchSpy = vi.fn(async () => ({ ok: true }));

    fetch = fetchSpy;

    let reloadSpy;
    try {
      reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});
    } catch {
      // jsdom can make window.location non-configurable in some contexts.
      Object.defineProperty(window, "location", { value: { reload: vi.fn() }, writable: true });
      reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});
    }

    await renderIndex({ initialSettings: { title: "Homepage", layout: {} }, settings: { layout: {} } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/revalidate");
    });
    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    });
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("mutates the hash when the window regains focus", async () => {
    state.validateData = [];
    state.hashData = { hash: "h" };
    state.windowFocused = true;

    await renderIndex({ initialSettings: { title: "Homepage", layout: {} }, settings: { layout: {} } });

    await waitFor(() => {
      expect(state.mutateHash).toHaveBeenCalled();
    });
  });

  it("stores the initial hash in localStorage when none exists", async () => {
    state.validateData = [];
    state.hashData = { hash: "first-hash" };
    localStorage.removeItem("hash");

    await renderIndex({ initialSettings: { title: "Homepage", layout: {} }, settings: { layout: {} } });

    await waitFor(() => {
      expect(localStorage.getItem("hash")).toBe("first-hash");
    });
  });
});

describe("pages/index Home behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.validateData = [];
    state.hashData = null;
    state.servicesData = [
      {
        name: "Services",
        services: [{ name: "s1", href: "http://svc/1" }, { name: "s2" }],
        groups: [{ name: "Nested", services: [{ name: "s3", href: "http://svc/3" }], groups: [] }],
      },
    ];
    state.bookmarksData = [{ name: "Bookmarks", bookmarks: [{ name: "b1", href: "http://bm/1" }, { name: "b2" }] }];
    state.widgetsData = [{ type: "glances" }, { type: "search" }];
    state.quickLaunchProps = null;
    state.widgetCalls = [];
  });

  it("passes href-bearing services and bookmarks to QuickLaunch and toggles search on keydown", async () => {
    await renderIndex({
      initialSettings: { title: "Homepage", layout: {} },
      settings: { title: "Homepage", layout: {}, language: "en" },
    });

    await waitFor(() => {
      expect(state.quickLaunchProps).toBeTruthy();
    });

    expect(state.quickLaunchProps.servicesAndBookmarks.map((i) => i.name)).toEqual(["b1", "s1", "s3"]);
    expect(screen.getByTestId("quicklaunch")).toHaveTextContent("closed:3");

    fireEvent.keyDown(document.body, { key: "a" });
    expect(screen.getByTestId("quicklaunch")).toHaveTextContent("open:3");

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.getByTestId("quicklaunch")).toHaveTextContent("closed:3");
  });

  it("renders services and bookmark groups when present", async () => {
    await renderIndex({
      initialSettings: { title: "Homepage", layout: {} },
      settings: { title: "Homepage", layout: {}, language: "en" },
    });

    expect(await screen.findByTestId("services-group")).toHaveTextContent("Services");
    expect(screen.getByTestId("bookmarks-group")).toHaveTextContent("Bookmarks");
  });

  it("renders tab navigation and filters groups by active tab", async () => {
    state.servicesData = [{ name: "Services", services: [], groups: [] }];
    state.bookmarksData = [{ name: "Bookmarks", bookmarks: [] }];

    await renderIndex({
      initialSettings: { title: "Homepage", layout: { Services: { tab: "Main" }, Bookmarks: { tab: "Main" } } },
      settings: { title: "Homepage", layout: { Services: { tab: "Main" }, Bookmarks: { tab: "Main" } } },
      activeTab: "main",
    });

    expect(await screen.findAllByTestId("tab")).toHaveLength(1);
    expect(screen.getAllByTestId("services-group")[0]).toHaveTextContent("Services");
    expect(screen.getAllByTestId("bookmarks-group")[0]).toHaveTextContent("Bookmarks");
  });

  it("waits for settings.layout to populate when it differs from initial settings", async () => {
    state.servicesData = [{ name: "Services", services: [], groups: [] }];
    state.bookmarksData = [{ name: "Bookmarks", bookmarks: [] }];

    await renderIndex({
      initialSettings: { title: "Homepage", layout: {} },
      // Missing layout triggers the temporary `<div />` return to avoid eager widget fetches.
      settings: { title: "Homepage" },
    });

    expect(screen.queryByTestId("services-group")).toBeNull();
    expect(screen.queryByTestId("bookmarks-group")).toBeNull();
  });

  it("applies cardBlur classes for tabs and boxed headers when configured", async () => {
    state.servicesData = [{ name: "Services", services: [], groups: [] }];
    state.bookmarksData = [{ name: "Bookmarks", bookmarks: [] }];
    state.widgetsData = [{ type: "search" }];

    await renderIndex({
      initialSettings: { title: "Homepage", layout: { Services: { tab: "Main" }, Bookmarks: { tab: "Main" } } },
      settings: {
        title: "Homepage",
        layout: { Services: { tab: "Main" }, Bookmarks: { tab: "Main" } },
        headerStyle: "boxed",
        cardBlur: "sm",
      },
      activeTab: "main",
    });

    expect(document.querySelector("#myTab")?.className).toContain("backdrop-blur-sm");
    expect(document.querySelector("#information-widgets")?.className).toContain("backdrop-blur-sm");
  });

  it("applies settings-driven language/theme/color updates and renders head tags", async () => {
    state.servicesData = [];
    state.bookmarksData = [];
    state.widgetsData = [];

    const { setTheme, setColor, setSettings } = await renderIndex({
      initialSettings: { title: "Homepage", layout: {} },
      settings: {
        title: "Homepage",
        layout: {},
        language: "en",
        theme: "light",
        color: "emerald",
        disableIndexing: true,
        base: "/base/",
        favicon: "/x.ico",
      },
      theme: "dark",
      color: "slate",
    });

    await waitFor(() => {
      expect(setSettings).toHaveBeenCalled();
    });
    expect(i18n.changeLanguage).toHaveBeenCalledWith("en");
    expect(setTheme).toHaveBeenCalledWith("light");
    expect(setColor).toHaveBeenCalledWith("emerald");

    expect(document.querySelector('meta[name="robots"][content="noindex, nofollow"]')).toBeTruthy();
    expect(document.querySelector("base")?.getAttribute("href")).toBe("/base/");
    expect(document.querySelector('link[rel="icon"]')?.getAttribute("href")).toBe("/x.ico");
  });

  it("marks information widgets as right-aligned for known widget types", async () => {
    await renderIndex({
      initialSettings: { title: "Homepage", layout: {} },
      settings: { title: "Homepage", layout: {}, language: "en" },
    });

    await waitFor(() => {
      expect(state.widgetCalls.length).toBeGreaterThan(0);
    });

    const rightAligned = state.widgetCalls.filter((c) => c.style?.isRightAligned).map((c) => c.widget.type);
    expect(rightAligned).toEqual(["search"]);
  });
});
