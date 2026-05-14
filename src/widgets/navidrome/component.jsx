import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

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

const statBlocks = [
  ["artists", "navidrome.artists"],
  ["albums", "navidrome.albums"],
  ["songs", "navidrome.songs"],
  ["playlists", "navidrome.playlists"],
];

function asEntryArray(entry) {
  if (Array.isArray(entry)) return entry;
  if (!entry) return [];
  if (entry.id || entry.title || entry.artist || entry.album || entry.username) return [entry];
  return Object.values(entry);
}

function LibraryStats({ libraryStats, service }) {
  const { t } = useTranslation();

  return (
    <Container service={service}>
      {statBlocks.map(([key, label]) => {
        const value = libraryStats?.[key];
        const displayValue = typeof value === "number" ? t("common.number", { value }) : "-";

        return <Block key={key} label={label} value={libraryStats ? displayValue : undefined} />;
      })}
    </Container>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: navidromeData, error: navidromeError } = useWidgetAPI(widget, "getNowPlaying");
  const { data: libraryStats } = useWidgetAPI(widget, "libraryStats", {
    refreshInterval: 60000,
  });

  if (navidromeError || navidromeData?.["subsonic-response"]?.error) {
    return <Container service={service} error={navidromeError ?? navidromeData?.["subsonic-response"]?.error} />;
  }

  if (!navidromeData) {
    return (
      <>
        <LibraryStats libraryStats={libraryStats} service={service} />
        <SinglePlayingEntry entry={{ title: t("navidrome.please_wait") }} />
      </>
    );
  }

  const nowPlaying = navidromeData?.["subsonic-response"]?.nowPlaying ?? {};
  const nowPlayingEntries = asEntryArray(nowPlaying.entry);
  if (!nowPlayingEntries.length) {
    // nothing playing
    return (
      <>
        <LibraryStats libraryStats={libraryStats} service={service} />
        <SinglePlayingEntry entry={{ title: t("navidrome.nothing_streaming") }} />
      </>
    );
  }

  return (
    <>
      <LibraryStats libraryStats={libraryStats} service={service} />
      <div className="flex flex-col pb-1 mx-1">
        {nowPlayingEntries.map((entry, index) => (
          <SinglePlayingEntry key={entry.id ?? `${entry.title ?? "entry"}-${index}`} entry={entry} />
        ))}
      </div>
    </>
  );
}
