/* eslint-disable react/no-array-index-key */
import useSWR, { SWRConfig } from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useEffect, useContext, useState } from "react";
import { BiError } from "react-icons/bi";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
import { bookmarksResponse, servicesResponse, widgetsResponse } from "utils/config/api-response";
import ErrorBoundary from "components/errorboundry";
import themes from "utils/styles/themes";
import QuickLaunch from "components/quicklaunch";
import { getStoredProvider, searchProviders } from "components/widgets/search/search";

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
    if (logger) {
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
    "m-4 mb-0 sm:m-8 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
  underlined: "m-4 mb-0 sm:m-8 sm:mb-1 border-b-2 pb-4 border-theme-800 dark:border-theme-200/50",
  clean: "m-4 mb-0 sm:m-8 sm:mb-0",
};

function Home({ initialSettings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);
  const { settings, setSettings } = useContext(SettingsContext);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings, setSettings]);

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");
  
  const servicesAndBookmarks = [...services.map(sg => sg.services).flat(), ...bookmarks.map(bg => bg.bookmarks).flat()]

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
  let searchProvider = null;
  const searchWidget = Object.values(widgets).find(w => w.type === "search");
  if (searchWidget) {
    if (Array.isArray(searchWidget.options?.provider)) {
      // if search provider is a list, try to retrieve from localstorage, fall back to the first
      searchProvider = getStoredProvider() ?? searchProviders[searchWidget.options.provider[0]];
    } else if (searchWidget.options?.provider === 'custom') {
      searchProvider = {
        url: searchWidget.options.url
      }
    } else {
      searchProvider = searchProviders[searchWidget.options?.provider];
    }
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "BODY") {
        if (String.fromCharCode(e.keyCode).match(/(\w|\s)/g) && !(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
          setSearching(true);
        } else if (e.key === "Escape") {
          setSearchString("");
          setSearching(false);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  })

  return (
    <>
      <Head>
        <title>{initialSettings.title || "Homepage"}</title>
        {initialSettings.base && <base href={initialSettings.base} />}
        {initialSettings.favicon ? (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href={initialSettings.favicon} />
            <link rel="icon" href={initialSettings.favicon} />
          </>
        ) : (
          <>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
            <link rel="shortcut icon" href="/homepage.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
          </>
        )}
        <meta
          name="msapplication-TileColor"
          content={themes[initialSettings.color || "slate"][initialSettings.theme || "dark"]}
        />
        <meta name="theme-color" content={themes[initialSettings.color || "slate"][initialSettings.theme || "dark"]} />
      </Head>
      <div className="relative container m-auto flex flex-col justify-between z-10">
        <div
          className={classNames(
            "flex flex-row flex-wrap  justify-between",
            headerStyles[initialSettings.headerStyle || "underlined"]
          )}
        >
          <QuickLaunch
            servicesAndBookmarks={servicesAndBookmarks}
            searchString={searchString}
            setSearchString={setSearchString}
            isOpen={searching}
            close={setSearching}
            searchDescriptions={settings.quicklaunch?.searchDescriptions}
            searchProvider={settings.quicklaunch?.hideInternetSearch ? null : searchProvider}
          />
          {widgets && (
            <>
              {widgets
                .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                .map((widget, i) => (
                  <Widget key={i} widget={widget} />
                ))}

              <div className="m-auto sm:ml-2 flex flex-wrap grow sm:basis-auto justify-between md:justify-end">
                {widgets
                  .filter((widget) => rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget key={i} widget={widget} />
                  ))}
              </div>
            </>
          )}
        </div>

        {services && (
          <div className="flex flex-wrap p-4 sm:p-8 sm:pt-4 items-start pb-2">
            {services.map((group) => (
              <ServicesGroup key={group.name} services={group} layout={initialSettings.layout?.[group.name]} />
            ))}
          </div>
        )}

        {bookmarks && (
          <div className={`grow flex flex-wrap pt-0 p-4 sm:p-8 gap-2 grid-cols-1 lg:grid-cols-2 lg:grid-cols-${Math.min(6, bookmarks.length)}`}>
            {bookmarks.map((group) => (
              <BookmarksGroup key={group.name} group={group} />
            ))}
          </div>
        )}

        <div className="flex p-8 pb-0 w-full justify-end">
          {!initialSettings?.color && <ColorToggle />}
          <Revalidate />
          {!initialSettings?.theme && <ThemeToggle />}
        </div>

        <div className="flex p-8 pt-4 w-full justify-end">
          <Version />
        </div>
      </div>
    </>
  );
}

export default function Wrapper({ initialSettings, fallback }) {
  const wrappedStyle = {};
  if (initialSettings && initialSettings.background) {
    const opacity = initialSettings.backgroundOpacity ?? 1;
    const opacityValue = 1 - opacity;
    wrappedStyle.backgroundImage = `
      linear-gradient(
        rgb(var(--bg-color) / ${opacityValue}),
        rgb(var(--bg-color) / ${opacityValue})
      ),
      url(${initialSettings.background})`;
    wrappedStyle.backgroundPosition = "center";
    wrappedStyle.backgroundSize = "cover";
  }

  return (
    <div
      id="page_wrapper"
      className={classNames(
        "relative",
        initialSettings.theme && initialSettings.theme,
        initialSettings.color && `theme-${initialSettings.color}`
      )}
    >
      <div
        id="page_container"
        className="fixed overflow-auto w-full h-full bg-theme-50 dark:bg-theme-800 transition-all"
        style={wrappedStyle}
      >
        <Index initialSettings={initialSettings} fallback={fallback} />
      </div>
    </div>
  );
}
