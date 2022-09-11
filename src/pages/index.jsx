/* eslint-disable react/no-array-index-key */
import useSWR from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";

import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widget";
import Revalidate from "components/revalidate";
import { getSettings } from "utils/config";
import { ColorProvider } from "utils/color-context";
import { ThemeProvider } from "utils/theme-context";

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
  const { data: services } = useSWR("/api/services");
  const { data: bookmarks } = useSWR("/api/bookmarks");
  const { data: widgets } = useSWR("/api/widgets");

  const wrappedStyle = {};
  if (settings.background) {
    wrappedStyle.backgroundImage = `url(${settings.background})`;
    wrappedStyle.backgroundSize = "cover";
  }

  return (
    <ColorProvider>
      <ThemeProvider>
        <Head>
          <title>{settings.title || "Homepage"}</title>
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
                <ServicesGroup key={group.name} services={group} />
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

          <div className="rounded-full flex p-8 w-full justify-between">
            <ColorToggle />
            <Revalidate />
            <ThemeToggle />
          </div>
        </div>
      </ThemeProvider>
    </ColorProvider>
  );
}
