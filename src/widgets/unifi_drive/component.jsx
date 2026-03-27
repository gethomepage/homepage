import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: storageData, error: storageError } = useWidgetAPI(widget, "storage");

  if (storageError) {
    return <Container service={service} error={storageError} />;
  }

  if (!storageData) {
    return (
      <Container service={service}>
        <Block label="unifi_drive.total" />
        <Block label="unifi_drive.used" />
        <Block label="unifi_drive.available" />
        <Block label="unifi_drive.status" />
      </Container>
    );
  }

  const { data: storage } = storageData;

  if (!storage) {
    return (
      <Container service={service}>
        <Block value={t("unifi_drive.no_data")} />
      </Container>
    );
  }

  const { totalQuota, usage, status } = storage;
  const usedBytes = (usage?.system || 0) + (usage?.myDrives || 0) + (usage?.sharedDrives || 0);
  const availableBytes = Math.max(0, totalQuota - usedBytes);

  const total = totalQuota > 0 ? t("common.bytes", { value: totalQuota }) : t("common.na");
  const used = t("common.bytes", { value: usedBytes });
  const available = t("common.bytes", { value: availableBytes });
  const statusValue = status === "healthy" ? t("unifi_drive.healthy") : t("unifi_drive.degraded");

  return (
    <Container service={service}>
      <Block label="unifi_drive.total" value={total} />
      <Block label="unifi_drive.used" value={used} />
      <Block label="unifi_drive.available" value={available} />
      <Block label="unifi_drive.status" value={statusValue} />
    </Container>
  );
}
