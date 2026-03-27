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
        <Block field="unifi_drive.total" label="resources.total" />
        <Block field="unifi_drive.used" label="resources.used" />
        <Block field="unifi_drive.available" label="resources.free" />
        <Block field="unifi_drive.status" label="widget.status" />
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
  const totalBytes = totalQuota ?? 0;
  const usedBytes = (usage?.system || 0) + (usage?.myDrives || 0) + (usage?.sharedDrives || 0);
  const availableBytes = Math.max(0, totalBytes - usedBytes);
  let statusValue = status;
  if (status === "healthy") statusValue = t("unifi_drive.healthy");
  else if (status === "degraded") statusValue = t("unifi_drive.degraded");

  return (
    <Container service={service}>
      <Block field="unifi_drive.total" label="resources.total" value={t("common.bytes", { value: totalBytes })} />
      <Block field="unifi_drive.used" label="resources.used" value={t("common.bytes", { value: usedBytes })} />
      <Block
        field="unifi_drive.available"
        label="resources.free"
        value={t("common.bytes", { value: availableBytes })}
      />
      <Block field="unifi_drive.status" label="widget.status" value={statusValue} />
    </Container>
  );
}
