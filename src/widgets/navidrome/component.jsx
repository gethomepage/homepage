import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: navidromeData, error: navidromeError } = useWidgetAPI(widget, "getNowPlaying");

  if (navidromeError || navidromeData?.error || navidromeData?.["subsonic-response"]?.error) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!navidromeData) {
    return (
      <Container service={service}>
        <Block label="navidrome.user" />
        <Block label="navidrome.artist" />
        <Block label="navidrome.song" />
        <Block label="navidrome.album" />
      </Container>
    );
  }

  const nowPlaying = navidromeData["subsonic-response"].nowPlaying;
  if (!nowPlaying.entry) {
    // nothing playing
    return (
      <Container service={service} />
    );
  }

  const nowPlayingEntries = Object.values(nowPlaying.entry);
  const songList = [];

  nowPlayingEntries.forEach(userPlay => {
      const playing = (
        <Container service={service}>
          <Block label="navidrome.user" value={userPlay.username} />
          <Block label="navidrome.artist" value={userPlay.artist} />
          <Block label="navidrome.song" value={userPlay.title} />
          <Block label="navidrome.album" value={userPlay.album} />
        </Container>
      );
      songList.unshift(playing);
    });

  return songList;
}
