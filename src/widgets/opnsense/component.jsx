import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: activityData, error: activityError } = useWidgetAPI(widget, "activity");
  const { data: interfaceData, error: interfaceError } = useWidgetAPI(widget, "interface");

  if (activityError || interfaceError) {
    const finalError = activityError ?? interfaceError;
    return <Container error={ finalError } />;
  }

  if (!activityData || !interfaceData) {
    return (
      <Container service={service}>
        <Block label="opnsense.cpu" />
        <Block label="opnsense.memory" />
        <Block label="opnsense.wanUpload" />
        <Block label="opnsense.wanDownload" />
      </Container>
    );
  }


  const cpuidle = activityData.headers[2].substring(60,64);
  const cpu = 100 - parseFloat(cpuidle);
  const memoryInfos = activityData.headers[3].split(" ");
  const totalMemory = parseFloat(memoryInfos[1]) + parseFloat(memoryInfos[3]) + parseFloat(memoryInfos[5]) + parseFloat(memoryInfos[7]) + parseFloat(memoryInfos[9])/1024 + parseFloat(memoryInfos[11]);
  const memory = ( 1 - parseFloat(memoryInfos[11]) / totalMemory) * 100;

  const wanUpload = interfaceData.interfaces.wan['bytes transmitted'];
  const wanDownload = interfaceData.interfaces.wan['bytes received'];

  return (
    <Container service={service}>
      <Block label="opnsense.cpu" value={t("common.percent", { value: cpu.toFixed(2) })}  />
      <Block label="opnsense.memory" value={t("common.percent", { value: memory })} />
      <Block label="opnsense.wanUpload" value={t("common.bytes", { value: wanUpload })} />
      <Block label="opnsense.wanDownload" value={t("common.bytes", { value: wanDownload })} />

    </Container>
  );
}
