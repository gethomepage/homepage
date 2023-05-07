/* eslint no-underscore-dangle: ["error", { "allow": ["_text", "_cdata"] }] */

import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation("common");

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="qnap.cpuUsage" />
        <Block label="qnap.memUsage" />
        <Block label="qnap.systemTempC" />
        <Block label="qnap.poolUsage" />
      </Container>
    );
  }

  const cpuUsage = statusData.system.cpu_usage._cdata.replace(' %','');
  const totalMemory = statusData.system.total_memory._cdata;
  const freeMemory = statusData.system.free_memory._cdata;
  const systemTempC = statusData.system.cpu_tempc._text;

  const volumeTotalSize = statusData.volume.volumeUse.total_size._cdata;
  const volumeFreeSize = statusData.volume.volumeUse.free_size._cdata;



  return (
    <Container service={service}>
      <Block 
        label="qnap.cpuUsage" 
        value={t("common.percent", { value: (cpuUsage) })}
      />
      <Block
        label="qnap.memUsage"
        value={t("common.percent", { value: (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(0) })}
      />
      <Block
        label="qnap.systemTempC"
        value={`${systemTempC} °C`} 
      />
      <Block
        label="qnap.poolUsage"
        value={t("common.percent", { value: (((volumeTotalSize - volumeFreeSize) / volumeTotalSize) * 100).toFixed(0) })}
      />
    </Container>
  );
}
