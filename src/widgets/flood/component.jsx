import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents");

  if (torrentError || !torrentData?.torrents) {
    return <Container error={torrentError ?? {message: "No torrent data returned"}} />;
  }

  if (!torrentData || !torrentData.torrents) {
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

  Object.values(torrentData.torrents).forEach(torrent => {
    rateDl += torrent.downRate;
    rateUl += torrent.upRate;
    if(torrent.status.includes('complete')){
      completed += 1;
    }
    if(torrent.status.includes('downloading')){
      leech += 1;
    }
  })

  return (
    <Container service={service}>
      <Block label="flood.leech" value={t("common.number", { value: leech })} />
      <Block label="flood.download" value={t("common.byterate", { value: rateDl })} />
      <Block label="flood.seed" value={t("common.number", { value: completed })} />
      <Block label="flood.upload" value={t("common.byterate", { value: rateUl })} />
    </Container>
  );
}
