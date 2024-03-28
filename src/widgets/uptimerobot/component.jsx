import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { t } = useTranslation();

  const { data: uptimerobotData, error: uptimerobotError } = useWidgetAPI(widget, "getmonitors");

  if (uptimerobotError) {
    return <Container service={service} error={uptimerobotError} />;
  }

  if (!uptimerobotData) {
    return (
      <Container service={service}>
        <Block label="uptimerobot.status" />
        <Block label="uptimerobot.uptime" />
      </Container>
    );
  }

  // multiple monitors
  if (uptimerobotData.pagination?.total > 1) {
    const sitesUp = uptimerobotData.monitors.filter((m) => m.status === 2).length;

    return (
      <Container service={service}>
        <Block label="uptimerobot.sitesUp" value={sitesUp} />
        <Block label="uptimerobot.sitesDown" value={uptimerobotData.pagination.total - sitesUp} />
      </Container>
    );
  }

  // single monitor
  const monitor = uptimerobotData.monitors[0];
  let status;
  let uptime = 0;
  let logIndex = 0;

  switch (monitor.status) {
    case 0:
      status = t("uptimerobot.paused");
      break;
    case 1:
      status = t("uptimerobot.notyetchecked");
      break;
    case 2:
      status = t("uptimerobot.up");
      uptime = t("common.uptime", { value: monitor.logs[0].duration });
      logIndex = 1;
      break;
    case 8:
      status = t("uptimerobot.seemsdown");
      break;
    case 9:
      status = t("uptimerobot.down");
      break;
    default:
      status = t("uptimerobot.unknown");
      break;
  }

  const lastDown = new Date(monitor.logs[logIndex].datetime * 1000).toLocaleString();
  const downDuration = t("common.uptime", { value: monitor.logs[logIndex].duration });
  const hideDown = logIndex === 1 && monitor.logs[logIndex].type !== 1;

  return (
    <Container service={service}>
      <Block label="uptimerobot.status" value={status} />
      <Block label="uptimerobot.uptime" value={uptime} />
      {!hideDown && <Block label="uptimerobot.lastDown" value={lastDown} />}
      {!hideDown && <Block label="uptimerobot.downDuration" value={downDuration} />}
    </Container>
  );
}
