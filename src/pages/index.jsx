/* eslint-disable react/no-array-index-key */
import useSWR, { SWRConfig } from "swr";
import Head from "next/head";
import Script from "next/script";
import dynamic from "next/dynamic";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useEffect, useContext, useState, useMemo } from "react";
import { BiError } from "react-icons/bi";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import Tab, { slugifyAndEncode } from "components/tab";
import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widgets/widget";
import Revalidate from "components/toggles/revalidate";
import createLogger from "utils/logger";
import useWindowFocus from "utils/hooks/window-focus";
import { getSettings } from "utils/config/config";
import { ColorContext } from "utils/contexts/color";
import { ThemeContext } from "utils/contexts/theme";
import { SettingsContext } from "utils/contexts/settings";
import { TabContext } from "utils/contexts/tab";
import { bookmarksResponse, servicesResponse, widgetsResponse } from "utils/config/api-response";
import ErrorBoundary from "components/errorboundry";
import themes from "utils/styles/themes";
import QuickLaunch from "components/quicklaunch";

const ThemeToggle = dynamic(() => import("components/toggles/theme"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/toggles/color"), {
  ssr: false,
});

const Version = dynamic(() => import("components/version"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather", "openmeteo", "search", "datetime"];

export async function getStaticProps() {
  let logger;
  try {
    logger = createLogger("index");
    const { providers, ...settings } = getSettings();

    const services = await servicesResponse();
    const bookmarks = await bookmarksResponse();
    const widgets = await widgetsResponse();

    return {
      props: {
        initialSettings: settings,
        fallback: {
          "/api/services": services,
          "/api/bookmarks": bookmarks,
          "/api/widgets": widgets,
          "/api/hash": false,
        },
        ...(await serverSideTranslations(settings.language ?? "en")),
      },
    };
  } catch (e) {
    if (logger && e) {
      logger.error(e);
    }
    return {
      props: {
        initialSettings: {},
        fallback: {
          "/api/services": [],
          "/api/bookmarks": [],
          "/api/widgets": [],
          "/api/hash": false,
        },
        ...(await serverSideTranslations("en")),
      },
    };
  }
}

function Index({ initialSettings, fallback }) {
  const windowFocused = useWindowFocus();
  const [stale, setStale] = useState(false);
  const { data: errorsData } = useSWR("/api/validate");
  const { data: hashData, mutate: mutateHash } = useSWR("/api/hash");

  useEffect(() => {
    if (windowFocused) {
      mutateHash();
    }
  }, [windowFocused, mutateHash]);

  useEffect(() => {
    if (hashData) {
      if (typeof window !== "undefined") {
        const previousHash = localStorage.getItem("hash");

        if (!previousHash) {
          localStorage.setItem("hash", hashData.hash);
        }

        if (previousHash && previousHash !== hashData.hash) {
          setStale(true);
          localStorage.setItem("hash", hashData.hash);

          fetch("/api/revalidate").then((res) => {
            if (res.ok) {
              window.location.reload();
            }
          });
        }
      }
    }
  }, [hashData]);

  if (stale) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-24 h-24 border-2 border-theme-400 border-solid rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (errorsData && errorsData.length > 0) {
    return (
      <div className="w-full h-screen container m-auto justify-center p-10 pointer-events-none">
        <div className="flex flex-col">
          {errorsData.map((error, i) => (
            <div
              className="basis-1/2 bg-theme-500 dark:bg-theme-600 text-theme-600 dark:text-theme-300 m-2 rounded-md font-mono shadow-md border-4 border-transparent"
              key={i}
            >
              <div className="bg-amber-200 text-amber-800 dark:text-amber-200 dark:bg-amber-800 p-2 rounded-md font-bold">
                <BiError className="float-right w-6 h-6" />
                {error.config}
              </div>
              <div className="p-2 text-theme-100 dark:text-theme-200">
                <pre className="opacity-50 font-bold pb-2">{error.reason}</pre>
                <pre className="text-sm">{error.mark.snippet}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SWRConfig value={{ fallback, fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()) }}>
      <ErrorBoundary>
        <Home initialSettings={initialSettings} />
      </ErrorBoundary>
    </SWRConfig>
  );
}

const headerStyles = {
  boxed:
    "m-5 mb-0 sm:m-9 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
  underlined: "m-5 mb-0 sm:m-9 sm:mb-1 border-b-2 pb-4 border-theme-800 dark:border-theme-200/50",
  clean: "m-5 mb-0 sm:m-9 sm:mb-0",
  boxedWidgets: "m-5 mb-0 sm:m-9 sm:mb-0 sm:mt-1",
};

function getAllServices(services) {
  function getServices(group) {
    let nestedServices = [...group.services];
    if (group.groups.length > 0) {
      nestedServices = [...nestedServices, ...group.groups.map(getServices).flat()];
    }
    return nestedServices;
  }

  return [...services.map(getServices).flat()];
}

function Home({ initialSettings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);
  const { settings, setSettings } = useContext(SettingsContext);
  const { activeTab, setActiveTab } = useContext(TabContext);
  const { asPath } = useRouter();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings, setSettings]);

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");

  const servicesAndBookmarks = [...bookmarks.map((bg) => bg.bookmarks).flat(), ...getAllServices(services)].filter(
    (i) => i?.href,
  );

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }

    if (settings.theme && theme !== settings.theme) {
      setTheme(settings.theme);
    }

    if (settings.color && color !== settings.color) {
      setColor(settings.color);
    }
  }, [i18n, settings, color, setColor, theme, setTheme]);

  const [searching, setSearching] = useState(false);
  const [searchString, setSearchString] = useState("");
  const headerStyle = settings?.headerStyle || "underlined";

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "BODY" || e.target.id === "inner_wrapper") {
        if (
          (e.key.length === 1 &&
            e.key.match(/(\w|\s|[à-ü]|[À-Ü]|[\w\u0430-\u044f])/gi) &&
            !(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) ||
          // accented characters and the bang may require modifier keys
          e.key.match(/([à-ü]|[À-Ü]|!)/g) ||
          (e.key === "v" && (e.ctrlKey || e.metaKey))
        ) {
          setSearching(true);
        } else if (e.key === "Escape") {
          setSearchString("");
          setSearching(false);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  const tabs = useMemo(
    () => [
      ...new Set(
        Object.keys(settings.layout ?? {})
          .map((groupName) => settings.layout[groupName]?.tab?.toString())
          .filter((group) => group),
      ),
    ],
    [settings.layout],
  );

  useEffect(() => {
    if (!activeTab) {
      const initialTab = asPath.substring(asPath.indexOf("#") + 1);
      setActiveTab(initialTab === "/" ? slugifyAndEncode(tabs["0"]) : initialTab);
    }
  });

  const servicesAndBookmarksGroups = useMemo(() => {
    const tabGroupFilter = (g) => g && [activeTab, ""].includes(slugifyAndEncode(settings.layout?.[g.name]?.tab));
    const undefinedGroupFilter = (g) => settings.layout?.[g.name] === undefined;

    const layoutGroups = Object.keys(settings.layout ?? {})
      .map((groupName) => services?.find((g) => g.name === groupName) ?? bookmarks?.find((b) => b.name === groupName))
      .filter(tabGroupFilter);

    if (!settings.layout && JSON.stringify(settings.layout) !== JSON.stringify(initialSettings.layout)) {
      // wait for settings to populate (if different from initial settings), otherwise all the widgets will be requested initially even if we are on a single tab
      return <div />;
    }

    const serviceGroups = services?.filter(tabGroupFilter).filter(undefinedGroupFilter);
    const bookmarkGroups = bookmarks.filter(tabGroupFilter).filter(undefinedGroupFilter);

    return (
      <>
        {tabs.length > 0 && (
          <div key="tabs" id="tabs" className="m-5 sm:m-9 sm:mt-4 sm:mb-0">
            <ul
              className={classNames(
                "sm:flex rounded-md bg-theme-100/20 dark:bg-white/5",
                settings.cardBlur !== undefined &&
                  `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
              )}
              id="myTab"
              data-tabs-toggle="#myTabContent"
              role="tablist"
            >
              {tabs.map((tab) => (
                <Tab key={tab} tab={tab} />
              ))}
            </ul>
          </div>
        )}
        {layoutGroups.length > 0 && (
          <div key="layoutGroups" id="layout-groups" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {layoutGroups.map((group) =>
              group.services ? (
                <ServicesGroup
                  key={group.name}
                  group={group}
                  layout={settings.layout?.[group.name]}
                  fiveColumns={settings.fiveColumns}
                  disableCollapse={settings.disableCollapse}
                  useEqualHeights={settings.useEqualHeights}
                  groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                />
              ) : (
                <BookmarksGroup
                  key={group.name}
                  bookmarks={group}
                  layout={settings.layout?.[group.name]}
                  disableCollapse={settings.disableCollapse}
                  groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                />
              ),
            )}
          </div>
        )}
        {serviceGroups?.length > 0 && (
          <div key="services" id="services" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {serviceGroups.map((group) => (
              <ServicesGroup
                key={group.name}
                group={group}
                layout={settings.layout?.[group.name]}
                fiveColumns={settings.fiveColumns}
                disableCollapse={settings.disableCollapse}
                groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
              />
            ))}
          </div>
        )}
        {bookmarkGroups?.length > 0 && (
          <div key="bookmarks" id="bookmarks" className="flex flex-wrap m-4 sm:m-8 sm:mt-4 items-start mb-2">
            {bookmarkGroups.map((group) => (
              <BookmarksGroup
                key={group.name}
                bookmarks={group}
                layout={settings.layout?.[group.name]}
                disableCollapse={settings.disableCollapse}
                groupsInitiallyCollapsed={settings.groupsInitiallyCollapsed}
                bookmarksStyle={settings.bookmarksStyle}
              />
            ))}
          </div>
        )}
      </>
    );
  }, [
    tabs,
    activeTab,
    services,
    bookmarks,
    settings.layout,
    settings.fiveColumns,
    settings.disableCollapse,
    settings.useEqualHeights,
    settings.cardBlur,
    settings.groupsInitiallyCollapsed,
    settings.bookmarksStyle,
    initialSettings.layout,
  ]);

  return (
    <>
      <Head>
        <title>{initialSettings.title || "Homepage"}</title>
        <meta
          name="description"
          content={
            initialSettings.description ||
            "A highly customizable homepage (or startpage / application dashboard) with Docker and service API integrations."
          }
        />
        {settings.base && <base href={settings.base} />}
        {settings.favicon ? (
          <>
            <link rel="icon" href={settings.favicon} />
            <link rel="apple-touch-icon" sizes="180x180" href={settings.favicon} />
          </>
        ) : (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
            <link rel="shortcut icon" href="/homepage.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg?v=4" color="#1e9cd7" />
          </>
        )}
        <meta name="msapplication-TileColor" content={themes[settings.color || "slate"][settings.theme || "dark"]} />
        <meta name="theme-color" content={themes[settings.color || "slate"][settings.theme || "dark"]} />
      </Head>

      <Script src="/api/config/custom.js" />

      <div className="relative container m-auto flex flex-col justify-start z-10 h-full">
        <QuickLaunch
          servicesAndBookmarks={servicesAndBookmarks}
          searchString={searchString}
          setSearchString={setSearchString}
          isOpen={searching}
          close={setSearching}
        />
        <div
          id="information-widgets"
          className={classNames(
            "flex flex-row flex-wrap justify-between z-20",
            headerStyles[headerStyle],
            settings.cardBlur !== undefined &&
              headerStyle === "boxed" &&
              `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          )}
        >
          <div id="widgets-wrap" className={classNames("flex flex-row w-full flex-wrap justify-between gap-x-2")}>
            {widgets && (
              <>
                {widgets
                  .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget
                      key={i}
                      widget={widget}
                      style={{ header: headerStyle, isRightAligned: false, cardBlur: settings.cardBlur }}
                    />
                  ))}

                <div
                  id="information-widgets-right"
                  className={classNames(
                    "m-auto flex flex-wrap grow sm:basis-auto justify-between md:justify-end",
                    "m-auto flex flex-wrap grow sm:basis-auto justify-between md:justify-end gap-x-2",
                  )}
                >
                  {widgets
                    .filter((widget) => rightAlignedWidgets.includes(widget.type))
                    .map((widget, i) => (
                      <Widget
                        key={i}
                        widget={widget}
                        style={{ header: headerStyle, isRightAligned: true, cardBlur: settings.cardBlur }}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {servicesAndBookmarksGroups}

        <div id="footer" className="flex flex-col mt-auto p-8 w-full">
          <div id="style" className="flex w-full justify-end">
            {!settings?.color && <ColorToggle />}
            <Revalidate />
            {!settings.theme && <ThemeToggle />}
          </div>

          <div id="version" className="flex mt-4 w-full justify-end">
            {!settings.hideVersion && <Version />}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Wrapper({ initialSettings, fallback }) {
  const { themeContext } = useContext(ThemeContext);
  const wrappedStyle = {};
  let backgroundBlur = false;
  let backgroundSaturate = false;
  let backgroundBrightness = false;
  if (initialSettings && initialSettings.background) {
    let opacity = initialSettings.backgroundOpacity ?? 1;
    let backgroundImage = initialSettings.background;
    if (typeof initialSettings.background === "object") {
      backgroundImage = initialSettings.background.image;
      backgroundBlur = initialSettings.background.blur !== undefined;
      backgroundSaturate = initialSettings.background.saturate !== undefined;
      backgroundBrightness = initialSettings.background.brightness !== undefined;
      if (initialSettings.background.opacity !== undefined) opacity = initialSettings.background.opacity / 100;
    }
    const opacityValue = 1 - opacity;
    wrappedStyle.backgroundImage = `
      linear-gradient(
        rgb(var(--bg-color) / ${opacityValue}),
        rgb(var(--bg-color) / ${opacityValue})
      ),
      url('${backgroundImage}')`;
    wrappedStyle.backgroundPosition = "center";
    wrappedStyle.backgroundSize = "cover";
  }

  return (
    <div
      id="page_wrapper"
      className={classNames(
        "relative",
        initialSettings.theme && initialSettings.theme,
        initialSettings.color && `theme-${initialSettings.color}`,
        themeContext === "dark" ? "scheme-dark" : "scheme-light",
      )}
    >
      <div
        id="page_container"
        className="fixed overflow-auto w-full h-full bg-theme-50 dark:bg-theme-800 transition-all"
        style={wrappedStyle}
      >
        <div
          id="inner_wrapper"
          tabIndex="-1"
          className={classNames(
            "fixed overflow-auto w-full h-full",
            backgroundBlur &&
              `backdrop-blur${initialSettings.background.blur.length ? "-" : ""}${initialSettings.background.blur}`,
            backgroundSaturate && `backdrop-saturate-${initialSettings.background.saturate}`,
            backgroundBrightness && `backdrop-brightness-${initialSettings.background.brightness}`,
          )}
        >
          <Index initialSettings={initialSettings} fallback={fallback} />
        </div>
      </div>
    </div>
  );
}
