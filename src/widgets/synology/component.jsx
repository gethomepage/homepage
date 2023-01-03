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
        <Block label="synology.uptime" />
        <Block label="synology.volumeUsage" />

      </Container>
    );
  }


  return (
    <Container service={service}>
      <Block label="synology.uptime" value={ dsData.uptime }  />
      <Block label="synology.volumeUsage" value={t("common.percent", { value: dsData.usedVolume })} />

    </Container>
  );
}
