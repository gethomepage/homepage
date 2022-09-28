import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget);

  if (torrentError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!torrentData) {
    return (
      <Container>
        <Block label={t("transmission.leech")} />
        <Block label={t("transmission.download")} />
        <Block label={t("transmission.seed")} />
        <Block label={t("transmission.upload")} />
      </Container>
    );
  }

  const { torrents } = torrentData.arguments;

  const rateDl = torrents.reduce((acc, torrent) => acc + torrent.rateDownload, 0);
  const rateUl = torrents.reduce((acc, torrent) => acc + torrent.rateUpload, 0);
  const completed = torrents.filter((torrent) => torrent.percentDone === 1)?.length || 0;
  const leech = torrents.length - completed || 0;

  return (
    <Container>
      <Block label={t("transmission.leech")} value={t("common.number", { value: leech })} />
      <Block label={t("transmission.download")} value={t("common.bitrate", { value: rateDl * 8 })} />
      <Block label={t("transmission.seed")} value={t("common.number", { value: completed })} />
      <Block label={t("transmission.upload")} value={t("common.bitrate", { value: rateUl * 8 })} />
    </Container>
  );
}
