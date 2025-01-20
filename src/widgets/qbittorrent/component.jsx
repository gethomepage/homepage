import { useTranslation } from "next-i18next";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents");

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  const leechTorrents = [];

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
    if (torrent.state.includes("DL") || torrent.state === "downloading") {
      leechTorrents.push(torrent);
    }
  }

  const leech = torrentData.length - completed;

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block label="qbittorrent.download" value={t("common.bibyterate", { value: rateDl, decimals: 1 })} />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
        <Block label="qbittorrent.upload" value={t("common.bibyterate", { value: rateUl, decimals: 1 })} />
      </Container>
      {widget?.enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={queueEntry.progress * 100}
            timeLeft={t("common.duration", { value: queueEntry.eta })}
            title={queueEntry.name}
            activity={queueEntry.state}
            key={`${queueEntry.name}-${queueEntry.amount_left}`}
          />
        ))}
    </>
  );
}
