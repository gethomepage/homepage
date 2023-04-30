import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

function SinglePlayingEntry({ entry }) {
  const { username, artist, title, album } = entry;
  let fullTitle = title;
  if (artist) fullTitle = `${artist} - ${title}`;
  if (album) fullTitle += ` — ${album}`;
  if (username) fullTitle += ` (${username})`;

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">{fullTitle}</div>
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: navidromeData, error: navidromeError } = useWidgetAPI(widget, "getNowPlaying");

  if (navidromeError || navidromeData?.["subsonic-response"]?.error) {
    return <Container service={service} error={navidromeError ?? navidromeData?.["subsonic-response"]?.error} />;
  }

  if (!navidromeData) {
    return (
      <SinglePlayingEntry entry={{ title: t("navidrome.please_wait") }} />
    );
  }

  const { nowPlaying } = navidromeData["subsonic-response"];
  if (!nowPlaying.entry) {
    // nothing playing
    return (
      <SinglePlayingEntry entry={{ title: t("navidrome.nothing_streaming") }} />
    );
  }

  const nowPlayingEntries = Object.values(nowPlaying.entry);

  return (
    <div className="flex flex-col pb-1 mx-1">
      {nowPlayingEntries.map((entry) => (
        <SinglePlayingEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
