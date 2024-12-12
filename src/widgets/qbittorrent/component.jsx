import { useTranslation } from "next-i18next";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatTimeLeft(inputSeconds) {
  let seconds = inputSeconds;
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  seconds %= 365 * 24 * 60 * 60;  // Remaining seconds after subtracting years

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;  // Remaining seconds after subtracting days

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;  // Remaining seconds after subtracting hours

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (years > 0) result = `over ${years}y`;
  else if (days > 0) result = `over ${days}d`;
  else if (hours > 0) result = `${hours}h ${minutes}m`;
  else if (minutes > 0) result = `${minutes}m ${remainingSeconds}s`;
  else result = `${remainingSeconds}s`;

  return result.trim();
}


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
  const enableLeechProgress = widget?.enableLeechProgress && Array.isArray(leechTorrents) && leechTorrents.length > 0;

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block label="qbittorrent.download" value={t("common.bibyterate", { value: rateDl, decimals: 1 })} />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
        <Block label="qbittorrent.upload" value={t("common.bibyterate", { value: rateUl, decimals: 1 })} />
      </Container>
      {enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={(queueEntry.progress) * 100}
            timeLeft={formatTimeLeft(queueEntry.eta)}
            title={queueEntry.name}
            activity={queueEntry.state}
            key={`${queueEntry.name}-${queueEntry.amount_left}`}
          />
        ))}
    </>
  );
}
