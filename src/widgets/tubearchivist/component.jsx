import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: downloadsData, error: downloadsError } = useWidgetAPI(widget, "downloads");
  const { data: videosData, error: videosError } = useWidgetAPI(widget, "videos");
  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "channels");
  const { data: playlistsData, error: playlistsError } = useWidgetAPI(widget, "playlists");

  if (downloadsError || downloadsData?.error || videosError || videosData?.error || channelsError || channelsData?.error || playlistsError || playlistsData?.error) {
    const finalError = downloadsError ?? downloadsData?.error ?? videosError ?? videosData?.error ?? channelsError ?? channelsData?.error ?? playlistsError ?? playlistsData?.error;
    return <Container error={finalError} />;
  }

  if (!downloadsData || !videosData || !channelsData || !playlistsData) {
    return (
      <Container service={service}>
        <Block label="tubearchivist.downloads" />
        <Block label="tubearchivist.videos" />
        <Block label="tubearchivist.channels" />
        <Block label="tubearchivist.playlists" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="tubearchivist.downloads" value={t("common.number", { value: downloadsData?.paginate?.total_hits })} />
      <Block label="tubearchivist.videos" value={t("common.number", { value: videosData?.paginate?.total_hits })} />
      <Block label="tubearchivist.channels" value={t("common.number", { value: channelsData?.paginate?.total_hits })} />
      <Block label="tubearchivist.playlists" value={t("common.number", { value: playlistsData?.paginate?.total_hits })} />
    </Container>
  );
}
