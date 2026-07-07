import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  // A specific instance id selects per-instance stats; otherwise aggregate all instances.
  const perInstance = widget.instance != null && widget.instance !== "";
  const mapping = perInstance ? "torrents" : "torrentsAll";
  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, mapping);

  const wantsField = (field) => widget.fields?.includes(field);

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
        {wantsField("total") && <Block label="qui.total" />}
        {wantsField("errored") && <Block label="qui.errored" />}
        {wantsField("ratio") && <Block label="qui.ratio" />}
        {wantsField("freeSpace") && <Block label="qui.freeSpace" />}
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
  const activeUp = stats.seeding;
  const activeDl = stats.downloading;
  const seedValue = `${t("common.number", { value: activeUp })} / ${t("common.number", { value: completed })}`;
  const leechValue = `${t("common.number", { value: activeDl })} / ${t("common.number", { value: incomplete })}`;

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
      {wantsField("total") && (
        <Block label="qui.total" value={t("common.number", { value: status ? status.all : stats.total })} />
      )}
      {wantsField("errored") && (
        <Block label="qui.errored" value={t("common.number", { value: status ? status.errored : stats.error })} />
      )}
      {wantsField("ratio") && serverState && (
        <Block label="qui.ratio" value={t("common.number", { value: parseFloat(serverState.global_ratio) })} />
      )}
      {wantsField("freeSpace") && serverState && (
        <Block
          label="qui.freeSpace"
          value={t("common.bbytes", { value: serverState.free_space_on_disk, maximumFractionDigits: 1 })}
        />
      )}
    </Container>
  );
}
