import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "status");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="strelaysrv.numActiveSessions" />
        <Block label="strelaysrv.numConnections" />
        <Block label="strelaysrv.bytesProxied" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="strelaysrv.numActiveSessions" value={t("common.number", { value: statsData.numActiveSessions })} />
      <Block label="strelaysrv.numConnections" value={t("common.number", { value: statsData.numConnections })} />
      <Block label="strelaysrv.dataRelayed" value={t("common.bytes", { value: statsData.bytesProxied })} />
      <Block
        label="strelaysrv.transferRate"
        value={t("common.bitrate", { value: statsData.kbps10s1m5m15m30m60m[5] })}
      />
    </Container>
  );
}
