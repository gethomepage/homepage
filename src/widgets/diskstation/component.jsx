import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: dsData, error: dsError } = useWidgetAPI(widget);

  if (dsError) {
    return <Container error={ dsError } />;
  }

  if (!dsData) {
    return (
      <Container service={service}>
        <Block label="diskstation.uptime" />
        <Block label="diskstation.volumeUsage" />
        <Block label="diskstation.volumeTotal" />
        <Block label="diskstation.cpuLoad" />
        <Block label="diskstation.memoryUsage" />
      </Container>
    );
  }


  return (
    <Container service={service}>
      <Block label="diskstation.uptime" value={ dsData.uptime }  />
      <Block label="diskstation.volumeUsage" value={t("common.percent", { value: dsData.usedVolume })} />
      <Block label="diskstation.volumeTotal" value={t("common.bytes", { value: dsData.totalSize })} />
      <Block label="diskstation.cpuLoad" value={t("common.percent", { value: dsData.cpuLoad })} />
      <Block label="diskstation.memoryUsage" value={t("common.percent", { value: dsData.memoryUsage })} />
    </Container>
  );
}
