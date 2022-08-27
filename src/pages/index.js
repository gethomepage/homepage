import useSWR from "swr";
import Head from "next/head";
import dynamic from "next/dynamic";

import { ThemeProvider } from "utils/theme-context";

import ServicesGroup from "components/services/group";
import BookmarksGroup from "components/bookmarks/group";
import Widget from "components/widget";
import { ColorProvider } from "utils/color-context";

const ThemeToggle = dynamic(() => import("components/theme-toggle"), {
  ssr: false,
});

const ColorToggle = dynamic(() => import("components/color-toggle"), {
  ssr: false,
});

const rightAlignedWidgets = ["weatherapi", "openweathermap", "weather"];

export default function Home() {
  const { data: services, error: servicesError } = useSWR("/api/services");
  const { data: bookmarks, error: bookmarksError } = useSWR("/api/bookmarks");
  const { data: widgets, error: widgetsError } = useSWR("/api/widgets");

  return (
    <ColorProvider>
      <ThemeProvider>
        <Head>
          <title>Welcome</title>
        </Head>
        <div className="w-full container m-auto flex flex-col h-screen justify-between">
          <div className="flex flex-wrap space-x-4 m-8 pb-4 mt-10 border-b-2 border-theme-800 dark:border-theme-200">
            {widgets && (
              <>
                {widgets
                  .filter((widget) => !rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget key={i} widget={widget} />
                  ))}
                <div className="grow"></div>
                {widgets
                  .filter((widget) => rightAlignedWidgets.includes(widget.type))
                  .map((widget, i) => (
                    <Widget key={i} widget={widget} />
                  ))}
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
            <ThemeToggle />
          </div>
        </div>
      </ThemeProvider>
    </ColorProvider>
  );
}
