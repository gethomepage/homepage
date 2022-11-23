import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget);

  if (torrentError) {
    return <Container error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="deluge.leech" />
        <Block label="deluge.download" />
        <Block label="deluge.seed" />
        <Block label="deluge.upload" />
      </Container>
    );
  }

  const { torrents } = torrentData;
  const keys = torrents ? Object.keys(torrents) : [];

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  for (let i = 0; i < keys.length; i += 1) {
    const torrent = torrents[keys[i]];
    rateDl += torrent.download_payload_rate;
    rateUl += torrent.upload_payload_rate;
    completed += torrent.total_remaining === 0 ? 1 : 0;
  }

  const leech = keys.length - completed || 0;

  return (
    <Container service={service}>
      <Block label="deluge.leech" value={t("common.number", { value: leech })} />
      <Block label="deluge.download" value={t("common.bitrate", { value: rateDl })} />
      <Block label="deluge.seed" value={t("common.number", { value: completed })} />
      <Block label="deluge.upload" value={t("common.bitrate", { value: rateUl })} />
    </Container>
  );
}
