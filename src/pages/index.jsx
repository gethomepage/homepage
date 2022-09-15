/* eslint-disable react/no-array-index-key */
import useSWR from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useEffect, useContext } from "react";

import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widget";
import Revalidate from "components/revalidate";
import { getSettings } from "utils/config";
import { ColorContext } from "utils/color-context";
import { ThemeContext } from "utils/theme-context";

const ThemeToggle = dynamic(() => import("components/theme-toggle"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/color-toggle"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather", "search"];

export async function getStaticProps() {
  const settings = await getSettings();

  return {
    props: {
      settings,
    },
  };
}

export default function Home({ settings }) {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { color, setColor } = useContext(ColorContext);

  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");

  const wrappedStyle = {};
  if (settings.background) {
    wrappedStyle.backgroundImage = `url(${settings.background})`;
    wrappedStyle.backgroundSize = "cover";
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
