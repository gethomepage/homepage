import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: speedtestData, error: speedtestError } = useWidgetAPI(widget, "speedtest/latest");

  if (speedtestError) {
    return <Container error={speedtestError} />;
  }

  if (!speedtestData) {
    return (
      <Container service={service}>
        <Block label="speedtest.download" />
        <Block label="speedtest.upload" />
        <Block label="speedtest.ping" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="speedtest.download"
        value={t("common.bitrate", { value: speedtestData.data.download * 1000 * 1000 })}
      />
      <Block label="speedtest.upload" value={t("common.bitrate", { value: speedtestData.data.upload * 1000 * 1000 })} />
      <Block
        label="speedtest.ping"
        value={t("common.ms", {
          value: speedtestData.data.ping,
          style: "unit",
          unit: "millisecond",
          unitDisplay: "narrow",
        })}
      />
    </Container>
  );
}
