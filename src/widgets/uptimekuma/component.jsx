import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status_page");
  const { data: heartbeatData, error: heartbeatError } = useWidgetAPI(widget, "heartbeat");

  if (statusError || heartbeatError) {
    return <Container error={statusError ?? heartbeatError} />;
  }

  if (!statusData || !heartbeatData) {
    return (
      <Container service={service}>
        <Block label="uptimekuma.up"/>
        <Block label="uptimekuma.down"/>
        <Block label="uptimekuma.uptime"/>
        <Block label="uptimekuma.incidents"/>
      </Container>
    );
  }

  let sitesUp = 0;
  let sitesDown = 0;
  Object.values(heartbeatData.heartbeatList).forEach((siteList) => {
    const lastHeartbeat = siteList[siteList.length - 1];
    if (lastHeartbeat?.status === 1) {
      sitesUp += 1;
    } else {
      sitesDown += 1;
    }
  });

  // Adapted from https://github.com/bastienwirtz/homer/blob/b7cd8f9482e6836a96b354b11595b03b9c3d67cd/src/components/services/UptimeKuma.vue#L105
  const uptimeList = Object.values(heartbeatData.uptimeList);
  const percent = uptimeList.reduce((a, b) => a + b, 0) / uptimeList.length || 0;
  const uptime = (percent * 100).toFixed(1);
  const incidentTime = statusData.incident ? (Math.abs(new Date(statusData.incident?.createdDate) - new Date()) / 1000) / (60 * 60) : null;

  return (
    <Container service={service}>
      <Block label="uptimekuma.up" value={t("common.number", { value: sitesUp })} />
      <Block label="uptimekuma.down" value={t("common.number", { value: sitesDown })} />
      <Block label="uptimekuma.uptime" value={t("common.percent", { value: uptime })} />
      {incidentTime && <Block label="uptimekuma.incident" value={t("common.number", { value: Math.round(incidentTime) }) + t("uptimekuma.m")} />}
    </Container>
  );
}
