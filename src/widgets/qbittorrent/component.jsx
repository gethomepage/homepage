import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: transferData, error: transferError } = useWidgetAPI(widget, "transfer");
  const { data: totalCountData, error: totalCountError } = useWidgetAPI(widget, "torrentCount");
  const { data: completedCountData, error: completedCountError } = useWidgetAPI(widget, "torrentCount", {
    filter: "completed",
  });
  const { data: leechTorrentData, error: leechTorrentError } = useWidgetAPI(
    widget,
    widget?.enableLeechProgress ? "torrents" : "",
    widget?.enableLeechProgress ? { filter: "downloading" } : undefined,
  );

  const apiError = transferError || totalCountError || completedCountError || leechTorrentError;
  if (apiError) {
    return <Container service={service} error={apiError} />;
  }

  if (
    !transferData ||
    totalCountData === undefined ||
    completedCountData === undefined ||
    (widget?.enableLeechProgress && !leechTorrentData)
  ) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
      </Container>
    );
  }

  const rateDl = Number(transferData?.dl_info_speed ?? 0);
  const rateUl = Number(transferData?.up_info_speed ?? 0);
  const totalCount = Number(totalCountData?.all ?? totalCountData?.count ?? totalCountData ?? 0);
  const completedCount = Number(
    completedCountData?.completed ?? completedCountData?.count ?? completedCountData?.all ?? completedCountData ?? 0,
  );
  const leech = Math.max(0, totalCount - completedCount);

  const leechTorrents = Array.isArray(leechTorrentData) ? [...leechTorrentData] : [];
  const statePriority = [
    "downloading",
    "forcedDL",
    "metaDL",
    "forcedMetaDL",
    "checkingDL",
    "stalledDL",
    "queuedDL",
    "pausedDL",
  ];
  leechTorrents.sort((firstTorrent, secondTorrent) => {
    const firstStateIndex = statePriority.indexOf(firstTorrent.state);
    const secondStateIndex = statePriority.indexOf(secondTorrent.state);
    if (firstStateIndex !== secondStateIndex) {
      return firstStateIndex - secondStateIndex;
    }
    return secondTorrent.progress - firstTorrent.progress;
  });

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block
          label="qbittorrent.download"
          value={t("common.bibyterate", { value: rateDl, decimals: 1 })}
          highlightValue={rateDl}
        />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completedCount })} />
        <Block
          label="qbittorrent.upload"
          value={t("common.bibyterate", { value: rateUl, decimals: 1 })}
          highlightValue={rateUl}
        />
      </Container>
      {widget?.enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={queueEntry.progress * 100}
            timeLeft={t("common.duration", { value: queueEntry.eta })}
            title={queueEntry.name}
            activity={queueEntry.state}
            size={
              widget?.enableLeechSize
                ? t("common.bbytes", { value: queueEntry.size, maximumFractionDigits: 1 })
                : undefined
            }
            key={`${queueEntry.name}-${queueEntry.amount_left}`}
          />
        ))}
    </>
  );
}
