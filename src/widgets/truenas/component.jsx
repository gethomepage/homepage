import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const processUptime = uptime => {

  const seconds = uptime.toFixed(0);

  const levels = [
    [Math.floor(seconds / 31536000), 'year'],
    [Math.floor((seconds % 31536000) / 2592000), 'month'],
    [Math.floor(((seconds % 31536000) % 2592000) / 86400), 'day'],
    [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hour'],
    [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minute'],
    [(((seconds % 31536000) % 86400) % 3600) % 60, 'second'],
  ];
  
  for (let i = 0; i< levels.length; i += 1) {
    const level = levels[i];
    if (level[0] > 0){
      return {
          value: level[0],
          unit: level[1]
        }
      } 
  }

  return {
    value: 0,
    unit: 'second'
  };
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: alertData, error: alertError } = useWidgetAPI(widget, "alerts");
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (alertError || alertData?.error || statusError || statusData?.error) {
    const finalError = alertError ?? alertData?.error ?? statusError ?? statusData?.error;
    return <Container error={finalError} />;
  }

  if (!alertData || !statusData) {
    return (
      <Container service={service}>
        <Block label="truenas.load" />
        <Block label="truenas.uptime" />
        <Block label="truenas.alerts" />
      </Container>
    );
  }
  
  return (
    <Container service={service}>
      <Block label="truenas.load" value={t("common.number", { value: statusData.loadavg[0] })} />
      <Block label="truenas.uptime" value={t('truenas.time', processUptime(statusData.uptime_seconds))} />
      <Block label="truenas.alerts" value={t("common.number", { value: alertData.pending })} />
    </Container>
  );
}
