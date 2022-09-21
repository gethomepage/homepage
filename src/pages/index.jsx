/* eslint-disable react/no-array-index-key */
import useSWR from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useEffect, useContext } from "react";
import { BiError } from "react-icons/bi";

import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widget";
import Revalidate from "components/revalidate";
import { getSettings } from "utils/config";
import { ColorContext } from "utils/color-context";
import { ThemeContext } from "utils/theme-context";
import { SettingsContext } from "utils/settings-context";

const ThemeToggle = dynamic(() => import("components/theme-toggle"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/color-toggle"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather", "search", "datetime"];

export function getStaticProps() {
  try {
    const { providers, ...settings } = getSettings();

    return {
      props: {
        initialSettings: settings,
      },
    };
  } catch (e) {
    return {
      props: {
        initialSettings: {},
      },
    };
  }
}

export default function Index({ initialSettings }) {
  const { data: errorsData } = useSWR("/api/validate");

  if (errorsData && errorsData.length > 0) {
    return (
      <div className="w-full container m-auto justify-center p-10">
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

  return <Home initialSettings={initialSettings} />;
}

function Home({ initialSettings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);
  const { settings, setSettings } = useContext(SettingsContext);

  if (initialSettings) {
    setSettings(initialSettings);
  }

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");

  const wrappedStyle = {};
  if (settings && settings.background) {
    wrappedStyle.backgroundImage = `url(${settings.background})`;
    wrappedStyle.backgroundSize = "cover";
    wrappedStyle.opacity = settings.backgroundOpacity ?? 1;
  }

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

  return (
    <>
      <Head>
        <title>{settings.title || "Homepage"}</title>
        {settings.base && <base href={settings.base} />}
        {settings.favicon && <link rel="icon" href={settings.favicon} />}
      </Head>
      <div className="fixed w-full h-full m-0 p-0" style={wrappedStyle} />
      <div className="relative w-full container m-auto flex flex-col h-screen justify-between">
        <div className="flex flex-row flex-wrap m-8 pb-4 mt-10 border-b-2 border-theme-800 dark:border-theme-200 justify-between">
          {widgets && (
            <>
              {widgets
                .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                .map((widget, i) => (
                  <Widget key={i} widget={widget} />
                ))}

              <div className="ml-4 flex flex-wrap basis-full grow sm:basis-auto justify-between md:justify-end mt-2 md:mt-0">
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
          <div className="flex flex-wrap p-8 items-start">
            {services.map((group) => (
              <ServicesGroup key={group.name} services={group} layout={settings.layout?.[group.name]} />
            ))}
          </div>
        )}

        {bookmarks && (
          <div className="grow flex flex-wrap pt-0 p-8">
            {bookmarks.map((group) => (
              <BookmarksGroup key={group.name} group={group} />
            ))}
          </div>
        )}

        <div className="rounded-full flex p-8 w-full justify-end">
          {!settings?.color && <ColorToggle />}
          <Revalidate />
          {!settings?.theme && <ThemeToggle />}
        </div>
      </div>
    </>
  );
}
