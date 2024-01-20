import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents/info");

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  // Default fields
  if (widget.fields === null || widget.fields.length === 0) {
    widget.fields = ["leech", "download", "seed", "upload"];
  }

  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields != null && widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
        <Block label="qbittorrent.total" />
        <Block label="qbittorrent.error" />
        <Block label="qbittorrent.checking" />
        <Block label="qbittorrent.moving" />
        <Block label="qbittorrent.activeUl" />
        <Block label="qbittorrent.activeDl" />
        <Block label="qbittorrent.active" />
        <Block label="qbittorrent.paused" />
        <Block label="qbittorrent.queued" />
        <Block label="qbittorrent.stalled" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  let error = 0;
  let checking = 0;
  let moving = 0;
  let activeUl = 0;
  let activeDl = 0;
  let active = 0;
  let paused = 0;
  let queued = 0;
  let stalled = 0;

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
    switch (torrent.state) {
      case "error":
      case "missingFiles":
      case "unknown":
        error += 1;
        break;

      case "checkingResumeData":
      case "checkingUP":
      case "checkingDL":
        checking += 1;
        break;

      case "moving":
        moving += 1;
        break;

      case "uploading":
        active += 1;
        activeUl += 1;
        break;

      case "downloading":
        active += 1;
        activeDl += 1;
        break;

      case "pausedUP":
      case "pausedDL":
        paused += 1;
        break;

      case "stalledUP":
      case "stalledDL":
        stalled += 1;
        break;

      case "queuedUP":
      case "queuedDL":
        queued += 1;
        break;

      default:
        break;
    }
  }

  const leech = torrentData.length - completed;
  const total = torrentData.length;

  return (
    <Container service={service}>
      <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
      <Block label="qbittorrent.download" value={t("common.bibyterate", { value: rateDl, decimals: 1 })} />
      <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
      <Block label="qbittorrent.upload" value={t("common.bibyterate", { value: rateUl, decimals: 1 })} />
      <Block label="qbittorrent.total" value={t("common.number", { value: total })} />
      <Block label="qbittorrent.error" value={t("common.number", { value: error })} />
      <Block label="qbittorrent.checking" value={t("common.number", { value: checking })} />
      <Block label="qbittorrent.moving" value={t("common.number", { value: moving })} />
      <Block label="qbittorrent.activeUl" value={t("common.number", { value: activeUl })} />
      <Block label="qbittorrent.activeDl" value={t("common.number", { value: activeDl })} />
      <Block label="qbittorrent.active" value={t("common.number", { value: active })} />
      <Block label="qbittorrent.paused" value={t("common.number", { value: paused })} />
      <Block label="qbittorrent.queued" value={t("common.number", { value: queued })} />
      <Block label="qbittorrent.stalled" value={t("common.number", { value: stalled })} />
    </Container>
  );
}
