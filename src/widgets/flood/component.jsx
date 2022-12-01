import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents");

  if (torrentError) {
    return <Container error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="flood.leech" />
        <Block label="flood.download" />
        <Block label="flood.seed" />
        <Block label="flood.upload" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  let leech = 0;

  for (var torrent in torrentData.torrents) {
    rateDl += torrentData.torrents[torrent].downRate;
    rateUl += torrentData.torrents[torrent].upRate;
    if(torrentData.torrents[torrent].status.includes('complete')){
      completed += 1;
    }
    if(torrentData.torrents[torrent].status.includes('downloading')){
      leech += 1;
    }
  }

  return (
    <Container service={service}>
      <Block label="flood.leech" value={t("common.number", { value: leech })} />
      <Block label="flood.download" value={t("common.bitrate", { value: rateDl })} />
      <Block label="flood.seed" value={t("common.number", { value: completed })} />
      <Block label="flood.upload" value={t("common.bitrate", { value: rateUl })} />
    </Container>
  );
}
