import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["leech", "download", "seed", "upload"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  // A specific instance id selects per-instance stats; otherwise aggregate all instances.
  const perInstance = widget.instance != null && widget.instance !== "";
  const mapping = perInstance ? "torrents" : "torrentsAll";
  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, mapping);

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData || !torrentData.stats) {
    return (
      <Container service={service}>
        <Block label="qui.leech" />
        <Block label="qui.download" />
        <Block label="qui.seed" />
        <Block label="qui.upload" />
        <Block label="qui.total" />
        <Block label="qui.errored" />
        <Block label="qui.ratio" />
        <Block label="qui.freeSpace" />
      </Container>
    );
  }

  const { stats } = torrentData;
  const status = torrentData.counts?.status;
  const serverState = torrentData.serverState;

  // counts.status uses qBittorrent's sidebar semantics (complete vs incomplete). Seed/Leech show
  // "active / total" — actively transferring over complete/incomplete. Fall back to stats-only.
  const completed = status ? status.completed : stats.seeding;
  const incomplete = status ? status.all - status.completed : stats.downloading;
  const seedValue = `${t("common.number", { value: stats.seeding })} / ${t("common.number", { value: completed })}`;
  const leechValue = `${t("common.number", { value: stats.downloading })} / ${t("common.number", { value: incomplete })}`;

  return (
    <Container service={service}>
      <Block label="qui.leech" value={leechValue} />
      <Block
        label="qui.download"
        value={t("common.bibyterate", { value: stats.totalDownloadSpeed, decimals: 1 })}
        highlightValue={stats.totalDownloadSpeed}
      />
      <Block label="qui.seed" value={seedValue} />
      <Block
        label="qui.upload"
        value={t("common.bibyterate", { value: stats.totalUploadSpeed, decimals: 1 })}
        highlightValue={stats.totalUploadSpeed}
      />
      <Block label="qui.total" value={t("common.number", { value: status ? status.all : stats.total })} />
      <Block label="qui.errored" value={t("common.number", { value: status ? status.errored : stats.error })} />
      {serverState && (
        <Block label="qui.ratio" value={t("common.number", { value: parseFloat(serverState.global_ratio) })} />
      )}
      {serverState && (
        <Block
          label="qui.freeSpace"
          value={t("common.bbytes", { value: serverState.free_space_on_disk, maximumFractionDigits: 1 })}
        />
      )}
    </Container>
  );
}
