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

function CountBlocks({ service, libraryData }) {
  const { t } = useTranslation();

  if (!libraryData) {
    return (
      <Container service={service}>
        <Block label="navidrome.songs" />
        <Block label="navidrome.albums" />
        <Block label="navidrome.artists" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="navidrome.songs" value={t("common.number", { value: libraryData.totalSongs })} />
      <Block label="navidrome.albums" value={t("common.number", { value: libraryData.totalAlbums })} />
      <Block label="navidrome.artists" value={t("common.number", { value: libraryData.totalArtists })} />
    </Container>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const enableBlocks = service.widget?.enableBlocks;
  const enableNowPlaying = service.widget?.enableNowPlaying ?? true;

  const { data: navidromeData, error: navidromeError } = useWidgetAPI(widget, enableNowPlaying ? "getNowPlaying" : "", {
    refreshInterval: enableNowPlaying ? 5000 : undefined,
  });
  const { data: libraryData, error: libraryError } = useWidgetAPI(widget, enableBlocks ? "Library" : "", {
    refreshInterval: enableBlocks ? 60000 : undefined,
  });

  if (navidromeError || libraryError || navidromeData?.["subsonic-response"]?.error) {
    return (
      <Container
        service={service}
        error={navidromeError ?? libraryError ?? navidromeData?.["subsonic-response"]?.error}
      />
    );
  }

  if ((enableNowPlaying && !navidromeData) || (enableBlocks && !libraryData)) {
    return (
      <>
        {enableBlocks && <CountBlocks service={service} libraryData={null} />}
        {enableNowPlaying && <SinglePlayingEntry entry={{ title: t("navidrome.please_wait") }} />}
      </>
    );
  }

  if (!enableNowPlaying && enableBlocks) {
    return <CountBlocks service={service} libraryData={libraryData} />;
  }

  const { nowPlaying } = navidromeData["subsonic-response"];
  if (!nowPlaying?.entry) {
    return (
      <>
        {enableBlocks && <CountBlocks service={service} libraryData={libraryData} />}
        <SinglePlayingEntry entry={{ title: t("navidrome.nothing_streaming") }} />
      </>
    );
  }

  const nowPlayingEntries = Object.values(nowPlaying.entry);

  return (
    <>
      {enableBlocks && <CountBlocks service={service} libraryData={libraryData} />}
      <div className="flex flex-col pb-1 mx-1">
        {nowPlayingEntries.map((entry) => (
          <SinglePlayingEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
}
