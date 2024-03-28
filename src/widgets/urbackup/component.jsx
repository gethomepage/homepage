import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const Status = Object.freeze({
  ok: Symbol("Ok"),
  errored: Symbol("Errored"),
  noRecent: Symbol("No Recent Backups"),
});

function hasRecentBackups(client, maxDays) {
  const days = maxDays || 3;
  const diffTime = days * 24 * 60 * 60; // 7 days
  const recentFile = client.lastbackup > Date.now() / 1000 - diffTime;
  const recentImage =
    client.image_not_supported || client.image_disabled || client.lastbackup_image > Date.now() / 1000 - diffTime;
  return recentFile && recentImage;
}

function determineStatuses(urbackupData) {
  let ok = 0;
  let errored = 0;
  let noRecent = 0;
  let status;
  urbackupData.clientStatuses.forEach((client) => {
    status = Status.noRecent;
    if (hasRecentBackups(client, urbackupData.maxDays)) {
      status =
        client.file_ok && (client.image_ok || client.image_not_supported || client.image_disabled)
          ? Status.ok
          : Status.errored;
    }
    switch (status) {
      case Status.ok:
        ok += 1;
        break;
      case Status.errored:
        errored += 1;
        break;
      case Status.noRecent:
        noRecent += 1;
        break;
      default:
        break;
    }
  });

  let totalUsage = false;

  // calculate total disk space if provided
  if (urbackupData.diskUsage) {
    totalUsage = 0.0;
    urbackupData.diskUsage.forEach((client) => {
      totalUsage += client.used;
    });
  }

  return { ok, errored, noRecent, totalUsage };
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const showDiskUsage = widget.fields?.includes("totalUsed");

  const { data: urbackupData, error: urbackupError } = useWidgetAPI(widget, "status");

  if (urbackupError) {
    return <Container service={service} error={urbackupError} />;
  }

  if (!urbackupData) {
    return (
      <Container service={service}>
        <Block label="urbackup.ok" />
        <Block label="urbackup.errored" />
        <Block label="urbackup.noRecent" />
        {showDiskUsage && <Block label="urbackup.totalUsed" />}
      </Container>
    );
  }

  const statusData = determineStatuses(urbackupData, widget);

  return (
    <Container service={service}>
      <Block label="urbackup.ok" value={t("common.number", { value: parseInt(statusData.ok, 10) })} />
      <Block label="urbackup.errored" value={t("common.number", { value: parseInt(statusData.errored, 10) })} />
      <Block label="urbackup.noRecent" value={t("common.number", { value: parseInt(statusData.noRecent, 10) })} />
      {showDiskUsage && (
        <Block
          label="urbackup.totalUsed"
          value={t("common.bbytes", { value: parseFloat(statusData.totalUsage, 10) })}
        />
      )}
    </Container>
  );
}
