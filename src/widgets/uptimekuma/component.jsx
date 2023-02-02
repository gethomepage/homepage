import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Block from "components/services/widget/block";

// Adapted from https://github.com/bastienwirtz/homer/blob/b7cd8f9482e6836a96b354b11595b03b9c3d67cd/src/components/services/UptimeKuma.vue#L59
function getMessage(heartbeatData) {
  let message = "good";
  if (Object.keys(heartbeatData.heartbeatList) === 0) {
    message = "unknown";
  }

  let hasUp = false;
  Object.values(heartbeatData.heartbeatList).forEach((siteList) => {
    const lastHeartbeat = siteList[siteList.length - 1];
    if (lastHeartbeat?.status === 1) {
      hasUp = true;
    } else {
      message = "warn";
    }
  });

  if (!hasUp) {
    message = "bad";
  }

  return message;
}

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
        <Block label="uptimekuma.status"/>
        <Block label="uptimekuma.uptime"/>
      </Container>
    );
  }

  const message = getMessage(heartbeatData);
  // Adapted from https://github.com/bastienwirtz/homer/blob/b7cd8f9482e6836a96b354b11595b03b9c3d67cd/src/components/services/UptimeKuma.vue#L105
  const uptimeList = Object.values(heartbeatData.uptimeList);
  const percent = uptimeList.reduce((a, b) => a + b, 0) / uptimeList.length || 0;
  const uptime = (percent * 100).toFixed(1);

  return (
    <Container service={service}>
      <Block label="uptimekuma.status" value={statusData.incident ? statusData.incident : t(`uptimekuma.${message}`)} />
      <Block label="uptimekuma.uptime" value={t("common.percent", { value: uptime })} />
    </Container>
  );
}
